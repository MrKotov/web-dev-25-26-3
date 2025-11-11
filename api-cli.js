#!/usr/bin/env node

const BASE_URL = "http://localhost:3000/api";

// Example JSON data embedded in the script
const exampleData = {
    universities: [
        {
            id: 1,
            name: "Tech University",
            location: "Boston"
        },
        {
            id: 2,
            name: "State University",
            location: "New York"
        }
    ],
    students: [
        {
            id: 1,
            facultyNumber: "FN001",
            firstName: "John",
            middleName: "Michael",
            lastName: "Doe",
            universityId: 1
        },
        {
            id: 2,
            facultyNumber: "FN002",
            firstName: "Jane",
            middleName: null,
            lastName: "Smith",
            universityId: 1
        },
        {
            id: 3,
            facultyNumber: "FN003",
            firstName: "Bob",
            middleName: "David",
            lastName: "Johnson",
            universityId: 2
        }
    ]
};

function showHelp() {
    console.log(`
╔════════════════════════════════════════════════════════════════╗
║           Student-University API CLI Tool                      ║
╚════════════════════════════════════════════════════════════════╝

USAGE:
  node api-cli.js <endpoint> <method>

ENDPOINTS:
  universities        Work with universities
  students            Work with students

METHODS:
  get                 GET request (list all or by ID)
  post                POST request (create new)
  put                 PUT request (update existing)
  delete              DELETE request (delete by ID)

EXAMPLES:
  node api-cli.js universities get
  node api-cli.js universities post
  node api-cli.js universities put
  node api-cli.js universities delete
  node api-cli.js students get
  node api-cli.js students post
  node api-cli.js students put
  node api-cli.js students delete

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

async function handleEndpoint(endpoint, method) {
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

    switch (method) {
        case "post":
            data = endpoint === "universities"
                ? exampleData.universities[0]
                : exampleData.students[0];
            break;

        case "put":
            data = endpoint === "universities"
                ? exampleData.universities[0]
                : exampleData.students[0];
            endpoint_path += "/1";
            break;

        case "delete":
            endpoint_path += "/1";
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

    if (!endpoint || !method) {
        console.error("❌ Error: endpoint and method arguments are required\n");
        showHelp();
        process.exit(1);
    }

    try {
        await handleEndpoint(endpoint, method);
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        process.exit(1);
    }
}

main();
