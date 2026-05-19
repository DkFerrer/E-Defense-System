# Post-Evaluation Module
*Part of the E-Defense System*

## Overview

The Post-Evaluation Module is a centralized information management system designed to handle the critical transition between the defense proceedings and final institutional clearance. It automates the collection, consolidation, and processing of evaluation data from panelists and secretaries into a single, standardized official report.

By eliminating manual data entry errors and ensuring consistency through departmental rubrics, the module provides a secure environment where the Research Coordinator manages data integrity via **data-locking**, and the Panel Chair issues final verdicts and book-binding clearances.

## Tech Stack

- **Language:** PHP / JavaScript
- **Framework:** Laravel (Backend API) / React (Frontend)
- **Database:** MySQL
- **Architecture:** Layered Service Architecture  
  *(Report Generation Service, Consolidation Engine, Access Control)*

## Installation Guide

### Clone the Repository

```bash
git clone https://github.com/Aandreyjiwoo/Post-Evaluation-Module---Quintela.git
cd Post-Evaluation-Module---Quintela
```

### Install Dependencies

```bash
composer install
npm install
pip install -r requirements.txt
```

### Set Up Environment Variables

Copy `.env.example` to `.env` and fill in the required values.

### Run the Application

```bash
php artisan serve
npm run dev
```

## Features

- **Automatic Consolidation**  
  Merges grades, remarks, and recommendations into a unified report based on departmental rubrics.

- **Verdict Management**  
  Enables the Panel Chair to assign official statuses such as:
  - Approved
  - Approved with Minor Revisions
  - Approved with Major Revisions
  - For Redefense

- **Data Integrity**  
  Implements data-locking to prevent modifications once the Research Coordinator generates the official report.

- **Book-binding Clearance**  
  Digital tracking for the transition from successful defense to final manuscript submission.

- **Role-Based Access**  
  Specialized dashboards for:
  - Research Coordinators
  - Panel Chairs
  - Students

- **History Tracking**  
  Stores and retrieves evaluation records across:
  - Title Defense
  - Review Defense
  - Final Defense

## Module Status

**Under Development**

## Database Entities

- `USER`
- `STUDENT_INFO`
- `RESEARCH_GROUP`
- `EVALUATION_RESULT`
- `CONSOLIDATED_REPORT`
- `FINAL_VERDICT`
- `AUDIT_LOG`

## Branch

This module is developed under:

```bash
feature/post-evaluation-module
```

## Main System Repository

This module is part of the [E-Defense System](https://github.com/DkFerrer/E-Defense-System)

## Contributors

| Name | Role |
|------|------|
| Andrey Quintela | Backend Developer / Database Engineer |
