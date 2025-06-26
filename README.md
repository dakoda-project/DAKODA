# DAKODA

# DAKODA Infrastructure Website

This repository contains the Eleventy-based website for the DAKODA Infrastructure project. It provides access to linguistic corpora, interactive dashboards, and related documentation.

✨ Features

- 🌐 Bilingual support: German (default) and English (toggle in header)
- 📁 Dynamic corpus repository page (auto-updated via metadata)
- 📊 Dashboard integrations (external links to Streamlit-based tools)
- 📚 Documentation and downloadable notebooks
- 💡 Easy-to-maintain static site using Eleventy
- 🎨 Professionally styled UI with responsive layout and light/dark mode toggle


## 🚀 Getting Started

Follow these steps to clone, set up, and run the Eleventy-based site locally.

### **1️⃣ Prerequisites**
Before running the site, ensure you have:
- **Node.js** (v16+ recommended) → [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)

### **⚠️ Important Note on Node.js Version**

Eleventy **3.0.0** requires **Node.js 18 or later**, which may cause compatibility issues if you're using an older version like **Node 16**.

To check your current Node.js version, run:
```sh
node -v
```
🔄 How to Upgrade Node.js Using nvm
```sh
nvm install 18
nvm use 18
```
To make Node 18 the default version, run:
```sh
nvm alias default 18
```


### **2️⃣ Clone the Repository**
```sh
git clone https://github.com/dakoda-project/DAKODA.git
cd DAKODA
```
### 3️⃣ Install Dependencies & Lock Eleventy Version
Install the required Node.js packages:
```sh
npm install
```
### 4️⃣ Run the Development Server
To start the local development server:
```sh
npx eleventy --serve
```
To prevent accidental updates and ensure all team members use the same Eleventy version, we install Eleventy locally:
```sh
npm install --save-dev @11ty/eleventy@3.0.0
```
✅ This locks the project to Eleventy 3.0.0, avoiding unintended updates.
Instead of using npx eleventy, run:
```sh
npm run start
```
✔ This method:
1. Prevents accidental version updates
2. Ensures everyone uses the same version
3. Works consistently across all machines & the university server

### Alternative Package Managers
To avoid potential security risks with npm, you can use:
pnpm → Faster & more secure alternative to npm
yarn → Another alternative with better version locking

```sh
pnpm install # If using pnpm:
yarn install # If using yarn:
```

🈯 Multilingual File Structure

Each content page has two versions:
- `*.de.njk` → German version (default)
- `*.en.njk` → English version

Eleventy builds pages like `index.de.html` and `index.en.html`. The site displays the German version by default, with a toggle in the header to switch to English.

### 📂 Project Structure
```
📦 DAKODA
 ┣ 📂 _includes/        # Reusable template parts (headers, footers)
 ┣ 📂 _site/            # Generated site output (do not edit manually also includes CSS)
 ┣ 📂 input/            # Main content files (index.njk, repository.njk, docs.njk)
 ┣ 📂 node_modules/     # Installed npm dependencies
 ┣ 📂 static/           # Static assets (images, files)
 ┣ 📜 .eleventy.js      # Eleventy configuration file
 ┣ 📜 package.json      # Project dependencies & scripts
 ┣ 📜 README.md         # This documentation
```

## 🚀 How to Add a New Corpus, Jupyter Notebooks and Manage Downloadable Files

This project uses a metadata-driven workflow powered by Eleventy to automatically display corpora on the repository page and generate individual detail pages per corpus. No need to hard-code new pages — just update a JSON file.
### 📂 How to Add a New Corpus to the Repository
### **1️⃣ Place the Corpus Data**
1. Navigate/Create the static/data/ directory inside the project.
2. Create a new folder for the corpus (e.g., CorpusA).
3. Add the dataset files inside this folder
```
static/
 ├── data/
 │   ├── CorpusA/
 │   │   ├── corpusA_texts.zip
 │   │   ├── corpusA_metadata.csv
 │   ├── CorpusB/
 │   │   ├── corpusB_texts.zip
 │   │   ├── corpusB_metadata.csv
```
### **2️⃣ Add Metadata for the New Corpus**
The metadata file (corpora.json) is stored inside the input/data/ directory. Open input/data/corpora.json and add an entry for the new corpus.

Example metadata entry:
```
{
  "id": "corpus-a",
  "title": "Corpus A",
  "description": "A linguistic corpus containing text samples.",
  "access": "public",
  "files": [
    {
      "name": "Corpus A Texts",
      "url": "/data/CorpusA/corpusA_texts.zip",
      "format": "zip"
    },
    {
      "name": "Corpus A Metadata",
      "url": "/data/CorpusA/corpusA_metadata.csv",
      "format": "csv"
    }
  ]
}

```

### ** 🔄 How the Workflow Works (Proof of Concept) **
This is how the Eleventy-based infrastructure dynamically creates pages from your metadata:

✅ Metadata File: input/data/corpora.json contains all corpus information.

✅ Data Loader: A JS file (input/_data/corpora.js) reads and merges corpora.json into Eleventy's data system.

✅ Repository Page: The pages repository.de.njk and repository.en.njk loop through the list of corpora and render cards/tables dynamically.

✅ Corpus Detail Pages: The template input/repository/corpus.njk uses Eleventy's pagination to generate one detail page per corpus based on the metadata.

✅ Output Pages: During build, Eleventy creates URLs like:

```
_site/repository/corpus-a/index.de.html
_site/repository/corpus-a/index.en.html

```
🎯 This means you never have to manually create corpus pages — they are automatically generated and updated using metadata.

🌍 Language Note: You can use language-specific corpus titles in `corpora.json`. These will be shown as-is in each language version of the repository page.


### 3️⃣ Update the Repository Page to Display the New Corpus
The repository page dynamically reads from corpora.json. No extra steps are needed if the metadata is correctly formatted.

### 📓 How to Add Jupyter Notebooks
You can include Jupyter notebooks (.ipynb files) inside the documentation section.
### **1️⃣ Place the Notebook in the Docs Directory**
1. Navigate to static/docs/
2. Add the .ipynb file here.

Example structure:
```
static/
 ├── docs/
 │   ├── corpusA_analysis.ipynb
 │   ├── corpusB_visualization.ipynb
```
### **2️⃣ Link the Notebook in the Docs Page**
Inside input/docs.njk, add a link to the notebook:
```
<li>
  <a href="/static/docs/corpusA_analysis.ipynb">Corpus A Analysis Notebook</a>
</li>
```
This will allow users to download the notebook from the documentation page.

### 📥 How to Manage Downloadable Files
Any downloadable files (datasets, metadata, analysis results) should be stored in the static/downloads/ folder.

### **1️⃣ Place the Downloadable File**
1. Navigate to static/downloads/
2. Upload the file (e.g., dataset_analysis.pdf)

Example structure:
```
static/
 ├── downloads/
 │   ├── dataset_analysis.pdf
 │   ├── research_paper.pdf
```
### **2️⃣ Link the File in the Repository or Docs Page**
To make the file accessible, link it inside input/repository.njk or input/docs.njk:
```
<a href="/static/downloads/dataset_analysis.pdf" download>Download Dataset Analysis</a>
```
Users will now be able to download the file.

### 🔒 Managing Public vs Restricted Access
If a dataset or document should be restricted:

Move it to static/private/ instead of static/downloads/
Use authentication to control access (not covered in Eleventy by default)

###  🤝 Contribution Guidelines

To contribute to this project:
```
1. Fork the repository.
2. Create a feature branch:
git checkout -b feature/your-feature-name
3. Make your changes and commit:
git commit -m "Add: Your feature description"
4. Push your changes:
git push origin feature/your-feature-name
5. Open a pull request (PR) on GitHub.
✅ Tip: Please test your changes locally before opening a PR.
```

## 🚀 Deployment Guide
Deployment is managed via the university server (not Netlify). The full guide will be available in `DEPLOYMENT.md`.



