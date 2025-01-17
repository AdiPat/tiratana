# Tiratana 💎

<p align="center">
  <img src="https://i.ibb.co/HTHZcLk/tiratana-logo.png" style="width: 84%; height: auto;">
</p>

**Tiratana** is a powerful and simple commandline tool (CLI) that generates useful codebase reports in a single command! Designed to save time and effort, Tiratana helps you uncover architectural insights, design patterns, potential vulnerabilities, and more, all in a minimal and elegant way.

---

## Why Tiratana?
Manually analyzing a codebase is often time-consuming and requires a high level of engineering proficiency. Tiratana streamlines this process by leveraging the power of modern programming and AI advancements to:

- Provide a quick overview of the codebase.
- Highlight architectural and design patterns.
- Detect potential vulnerabilities.
- Save time for developers, consultants, and teams.
- Whether you’re reviewing your codebase or analyzing one for a client, Tiratana offers actionable insights in a compact, easy-to-understand markdown report.

---

## **Installation**

Install Tiratana using npm:

```bash
npm install tiratana -g
```
### Custom Environment Variables
If you want to use custom environment variables, you can create a file with the name `env` in the root directory of your project. The file should contain `OPENAI_API_KEY=<your_api_key>`.

```bash
tiratana -d ./my-codebase --env ./path/to/env/file.env
```
---

## **Usage**

Run Tiratana on a codebase:

```bash
tiratana -d ./my-project -o report.md -v
```

### **Options**

- **`--directory, -d`**: The directory to process (required).
- **`--outputFile, -o`**: Specify a file to save the generated report (optional).
- **`--verbose, -v`**: Print verbose logs (default: false).
- **`--performanceStats, -p`**: Display performance statistics (optional).
- **`--writePreliminaryAnalysis, -z`**: Save preliminary analysis to a file (optional).
- **`--standardize, -s`**: Generate a standardized report (optional).
- **`--standardizationFile, -f`**: Use a file for report standardization (optional).
- **`--env, -e`**: Specify an environment file to load (optional).
- **`--version`**: Show the current version of Tiratana.
- **`--help`**: Show help.

---

## **Examples**

### Generate a basic report (output file is autogenerated):
```bash
tiratana -d ./my-codebase
```

### Generate a report and save it to a named file:
```bash
tiratana -d ./my-codebase -o report.md
```

### Enable verbose logging:
```bash
tiratana -d ./my-codebase -v
```

### Generate performance statistics:
```bash
tiratana -d ./my-codebase -p
```

### Using custom environment variables:
```bash
tiratana -d ./my-codebase --env ./path/to/env/file.env
```

---   

## **For Contributors**

We welcome contributions! Follow these steps to get started:

### **Setup Instructions**

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/tiratana.git
   cd tiratana
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the package:
   ```bash
   npm run build
   ```

4. Start the application:
   ```bash
   npm run start
   ```

5. Run tests:
   ```bash
   npm run test
   ```

### **Contribution Guidelines**

- Fork the repository and create a new branch for your feature or fix.
- Make your changes and ensure they pass all tests.
- Submit a pull request with a clear description of your changes.

---

## **License**

Tiratana is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

---

Start generating smarter codebase reports with Tiratana today! 🎉


> _"I don't configure what I can't figure"_ 🦹🏼 — Aditya Patange (AdiPat)

