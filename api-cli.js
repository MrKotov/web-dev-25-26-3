#!/usr/bin/env node

const BASE_URL = "http://localhost:3000/api";

// Example JSON data - single objects that users can replace
const exampleData = {
    university: {
        name: "Tech University",
        location: "Boston"
    },
    student: {
        facultyNumber: "FN001",
        firstName: "John",
        middleName: "Michael",
        lastName: "Doe",
        universityId: 4
    }
};

function showHelp() {
    console.log(`
╔════════════════════════════════════════════════════════════════╗
║           Student-University API CLI Tool                      ║
╚════════════════════════════════════════════════════════════════╝

USAGE:
  node api-cli.js <endpoint> <method> [id]

ENDPOINTS:
  universities        Work with universities
  students            Work with students

METHODS:
  get                 GET request (list all or by ID)
  post                POST request (create new)
  put                 PUT request (update by ID)
  delete              DELETE request (delete by ID)

EXAMPLES:
  node api-cli.js universities get           # Get all universities
  node api-cli.js universities get 1         # Get university with ID 1
  node api-cli.js universities post          # Create a new university
  node api-cli.js universities put 1         # Update university with ID 1
  node api-cli.js universities delete 1      # Delete university with ID 1
  
  node api-cli.js students get               # Get all students
  node api-cli.js students get 2             # Get student with ID 2
  node api-cli.js students post              # Create a new student
  node api-cli.js students put 2             # Update student with ID 2
  node api-cli.js students delete 2          # Delete student with ID 2

EXAMPLE DATA:
${JSON.stringify(exampleData, null, 2)}
  `);
}

async function request(method, endpoint, body = null) {
    try {
        const options = {
            method,
            headers: {
                "Content-Type": "application/json",
            },
        };

        if (body) {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(`${BASE_URL}${endpoint}`, options);
        const data = await response.json();

        return { status: response.status, data, ok: response.ok };
    } catch (error) {
        return { status: 0, data: null, ok: false, error: error.message };
    }
}

function formatOutput(endpoint, method, status, data) {
    console.log("\n" + "═".repeat(60));
    console.log(`${method.toUpperCase()} ${endpoint}`);
    console.log("═".repeat(60));
    console.log(`Status: ${status}`);
    console.log("\nResponse:");
    console.log(JSON.stringify(data, null, 2));
    console.log("═".repeat(60) + "\n");
}

async function handleEndpoint(endpoint, method, id) {
    endpoint = endpoint.toLowerCase();
    method = method.toLowerCase();

    // Validate endpoint
    if (!["universities", "students"].includes(endpoint)) {
        console.error(`❌ Unknown endpoint: ${endpoint}`);
        showHelp();
        process.exit(1);
    }

    // Validate method
    if (!["get", "post", "put", "delete"].includes(method)) {
        console.error(`❌ Unknown method: ${method}`);
        showHelp();
        process.exit(1);
    }

    let endpoint_path = `/${endpoint}`;
    let data = null;

    // Build the endpoint path with id if provided
    if (id) {
        endpoint_path += `/${id}`;
    }

    switch (method) {
        case "post":
            data = endpoint === "universities"
                ? exampleData.university
                : exampleData.student;
            break;

        case "put":
            if (!id) {
                console.error("❌ Error: id is required for PUT method");
                process.exit(1);
            }
            data = endpoint === "universities"
                ? exampleData.university
                : exampleData.student;
            break;

        case "delete":
            if (!id) {
                console.error("❌ Error: id is required for DELETE method");
                process.exit(1);
            }
            break;
    }

    // Call the actual API
    const res = await request(method.toUpperCase(), endpoint_path,
        (method === "post" || method === "put") ? data : null);

    formatOutput(endpoint_path, method, res.status, res.data);
}

async function main() {
    const args = process.argv.slice(2);

    if (args.length === 0 || args[0] === "-h" || args[0] === "--help") {
        showHelp();
        process.exit(args.length === 0 ? 1 : 0);
    }

    const endpoint = args[0];
    const method = args[1];
    const id = args[2];

    if (!endpoint || !method) {
        console.error("❌ Error: endpoint and method arguments are required\n");
        showHelp();
        process.exit(1);
    }

    try {
        await handleEndpoint(endpoint, method, id);
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        process.exit(1);
    }
}

main();
