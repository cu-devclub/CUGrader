```sh
oapi-codegen -config generate_types.yaml ../api-specification/bundled.yaml
oapi-codegen -config generate_gin.yaml ../api-specification/bundled.yaml
```

```sh
go run cmd/main.go
```



note
edit class to use function insert section/group if not exist in utils