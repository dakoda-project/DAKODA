# DAKODA

# DAKODA Infrastructure Website

This repository contains the Eleventy-based website for the DAKODA Infrastructure project. It provides access to linguistic corpora, interactive dashboards, and related documentation.

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
### 3️⃣ Install Dependencies
Install the required Node.js packages:
```sh
npm install
```
### 4️⃣ Run the Development Server
To start the local development server:
```sh
npx eleventy --serve
```

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

Adding a new corpus involves placing the dataset in the appropriate directory and updating the metadata file so it appears in the repository page.
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
  "name": "Corpus A",
  "description": "A linguistic corpus containing text samples.",
  "access": "public",
  "files": [
    {
      "name": "Corpus A Texts",
      "url": "/static/data/CorpusA/corpusA_texts.zip",
      "format": "zip"
    },
    {
      "name": "Corpus A Metadata",
      "url": "/static/data/CorpusA/corpusA_metadata.csv",
      "format": "csv"
    }
  ]
}

```
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

## 🚀 Deployment Guide
For detailed deployment instructions, see the [Deployment Guide](DEPLOYMENT.md).


