db("cugrader").createCollection("code", {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: ["content"],
            properties: {
                content: {
                    bsonType: "string",
                    description: "code content"
                }
            }
        }
    }
});

db("cugrader").createCollection("markdown", {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: ["content"],
            properties: {
                content: {
                    bsonType: "string",
                    description: "description content"
                }
            }
        }
    }
});

db("cugrader").createCollection("submission", {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: ["pages"],
            properties: {
                pages: {
                    bsonType: "array",
                    items: {
                        bsonType: "object",
                        required: ["name", "code_object_id"],
                        properties: {
                            name: {
                                bsonType: "string",
                                description: "name of the code page"
                            },
                            code_object_id: {
                                bsonType: "objectId",
                                description: "reference to the code object"
                            },
                        }
                    },
                    description: "list of code pages"
                }
            }
        }
    }
});

db("cugrader").createCollection("multilang_testcase", {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: ["input", "output"],
            properties: {
                input: {
                    bsonType: "objectId",
                    description: "code object id"
                },
                output: {
                    bsonType: "objectId",
                    description: "code object id"
                }
            }
        }
    }
});