Evaluation Module

## Overview

The **Evaluation Module** is a core component of the **E-Defense System** developed for the **University of Nueva Caceres**. It is designed to digitize and standardize the assessment process for thesis and capstone research defense proceedings, replacing manual paper-based evaluation workflows with an automated, transparent, and auditable system.

The module enables panel members to evaluate student research presentations using configurable rubrics aligned with institutional academic standards. It supports real-time scoring, automated computation of final grades, evaluator feedback collection, and centralized storage of evaluation results.

The module ensures fairness, consistency, and accuracy in grading while reducing administrative workload and improving reporting efficiency for faculty, coordinators, and academic administrators.

---

## Features

* Creation and management of evaluation rubrics and scoring criteria
* Role-based evaluator access during scheduled defense sessions
* Real-time scoring submission by panel members
* Automated computation of final grades and weighted scores
* Individual evaluator comments and recommendations recording
* Pass/Fail determination based on configurable grading rules
* Evaluation locking after submission to prevent unauthorized edits
* Consolidated evaluation summary generation
* Panel consensus and final decision recording
* Automated notification of submitted evaluations
* Exportable evaluation reports (PDF/print-ready format)
* Historical evaluation records and audit trail tracking
* Integration with Scheduling Module for session-based evaluation access

---

## Module Status

**Under Development**

---

## Related Database Tables

```
USER
EVALUATION
EVALUATION_CRITERIA
EVALUATION_RUBRIC
EVALUATION_SCORE
EVALUATION_RESULT
EVALUATION_COMMENT
DEFENSE_SESSION
PANEL_MEMBER
GRADE_SCALE
FINAL_DECISION
NOTIFICATION
AUDIT_LOG
```

---

## Tech Stack

**Language:** PHP / JavaScript
**Framework:** Laravel (Backend API) / React (Frontend)
**Database:** MySQL

**Architecture:**
Composable layered architecture with API Gateway and microservices:

* Evaluation Service
* Rubric Management Service
* Access Control Service
* Notification Service

---

## Branch

This module is developed under:

```

---

## Main System Repository

This module is part of the **E-Defense System**.

---

## Developer

| Name                | Role                                          |
| ------------------- | --------------------------------------------- |
| Janna Mae Asa| Frontend Developer / UI-UX Designer|
