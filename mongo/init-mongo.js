db.getSiblingDB('admin').auth(
  process.env.MONGO_INITDB_ROOT_USERNAME,
  process.env.MONGO_INITDB_ROOT_PASSWORD
);

// Switch to cugrader database
db = db.getSiblingDB('cugrader');

// Create "code" collection
db.createCollection("code", {
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

// Create "markdown" collection
db.createCollection("markdown", {
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

// Create "submission" collection
db.createCollection("submission", {
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
              }
            }
          },
          description: "list of code pages"
        }
      }
    }
  }
});
