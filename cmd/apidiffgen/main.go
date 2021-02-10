package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"
	"path/filepath"
	"strings"

	"github.com/googleapis/gnostic/openapiv2"
	"github.com/pkg/errors"
	"gopkg.in/yaml.v3"
	"k8s.io/apimachinery/pkg/runtime/schema"
	"k8s.io/kubectl/pkg/util/openapi"
)

type openAPISchema struct {
	openapi.Resources
	allGVKs map[schema.GroupVersionKind]struct{}
}

func docToSchema(doc *openapi_v2.Document) (*openAPISchema, error) {
	resources, err := openapi.NewOpenAPIData(doc)
	if err != nil {
		return nil, errors.Wrap(err, "parsing OpenAPI document")
	}
	allGVKs := make(map[schema.GroupVersionKind]struct{})
	for _, def := range doc.GetDefinitions().GetAdditionalProperties() {
		for _, vendorExt := range def.GetValue().GetVendorExtension() {
			if vendorExt.GetName() != "x-kubernetes-group-version-kind" {
				continue
			}
			var gvks []schema.GroupVersionKind
			yamlDec := yaml.NewDecoder(strings.NewReader(vendorExt.GetValue().GetYaml()))
			yamlDec.KnownFields(true)
			if err := yamlDec.Decode(&gvks); err != nil {
				return nil, errors.Wrapf(err, "decoding x-kubernetes-group-version-kind vendor extension from %s", vendorExt.GetValue().GetYaml())
			}
			for _, gvk := range gvks {
				allGVKs[gvk] = struct{}{}
			}
		}
	}
	return &openAPISchema{
		Resources: resources,
		allGVKs:   allGVKs,
	}, nil
}

func getSchemas(swaggerDir string) (map[string]*openAPISchema, error) {
	swaggerFiles, err := ioutil.ReadDir(swaggerDir)
	if err != nil {
		return nil, err
	}

	schemas := make(map[string]*openAPISchema)
	for _, swaggerFile := range swaggerFiles {
		fileName := swaggerFile.Name()
		if !strings.HasSuffix(fileName, ".json") {
			continue
		}
		swaggerBytes, err := ioutil.ReadFile(filepath.Join(swaggerDir, fileName))
		if err != nil {
			return nil, errors.Wrapf(err, "reading file %s", fileName)
		}
		openAPIDoc, err := openapi_v2.ParseDocument(swaggerBytes)
		if err != nil {
			return nil, errors.Wrapf(err, "parsing open api from file %s", fileName)
		}
		schm, err := docToSchema(openAPIDoc)
		if err != nil {
			return nil, errors.Wrapf(err, "converting doc to schema for file %s", fileName)
		}
		schemas[fileName] = schm
	}

	return schemas, nil

}

func mainCmd() error {
	if len(os.Args) < 2 {
		return fmt.Errorf("Usage: %s <swagger_dir>\n", os.Args[0])
	}
	swaggerDir := os.Args[1]
	schemas, err := getSchemas(swaggerDir)
	if err != nil {
		return err
	}
	m := make(map[string][]schema.GroupVersionKind)
	for k, schm := range schemas {
		for gvk := range schm.allGVKs {
			m[k] = append(m[k], gvk)
		}
	}
	marshaled, err := json.Marshal(m)
	if err != nil {
		return err
	}
	fmt.Print(string(marshaled))

	return nil
}

func main() {
	if err := mainCmd(); err != nil {
		fmt.Printf("Error executing program: %v\n", err)
		os.Exit(1)
	}
}