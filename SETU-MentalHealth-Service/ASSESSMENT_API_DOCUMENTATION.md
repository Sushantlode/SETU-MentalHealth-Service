# Assessment API Documentation

This document provides comprehensive information about all assessment endpoints for frontend development.

## Base URL
```
http://localhost:3000/assessments
```

## Authentication
For protected endpoints, include the JWT token in the Authorization header:
```http
Authorization: Bearer <your_jwt_token>
```

---

## 1. GET /assessments - List All Assessments

**Public endpoint (no authentication required)**

### Request
```http
GET /assessments
```

### Response (200)
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Depression Screening",
      "subTitle": "A comprehensive assessment for depression symptoms",
      "imageUrl": "https://example.com/image.jpg",
      "status": "active",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z",
      "questions": [
        {
          "id": 1,
          "text": "How often do you feel sad or hopeless?",
          "order": 1,
          "options": [
            {
              "id": 1,
              "text": "Never",
              "value": 0
            },
            {
              "id": 2,
              "text": "Sometimes",
              "value": 1
            },
            {
              "id": 3,
              "text": "Often",
              "value": 2
            },
            {
              "id": 4,
              "text": "Always",
              "value": 3
            }
          ]
        }
      ],
      "scoreBands": [
        {
          "id": 1,
          "label": "Low Risk",
          "minScore": 0,
          "maxScore": 5,
          "color": "green",
          "recommendation": "Continue monitoring your mental health"
        }
      ]
    }
  ]
}
```

---

## 2. GET /assessments/:id - Get Assessment Details

**Public endpoint (no authentication required)**

### Request
```http
GET /assessments/1
```

### Response (200)
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Depression Screening",
    "subTitle": "A comprehensive assessment for depression symptoms",
    "imageUrl": "https://example.com/image.jpg",
    "status": "active",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "questions": [
      {
        "id": 1,
        "text": "How often do you feel sad or hopeless?",
        "order": 1,
        "options": [
          {
            "id": 1,
            "text": "Never",
            "value": 0
          },
          {
            "id": 2,
            "text": "Sometimes",
            "value": 1
          },
          {
            "id": 3,
            "text": "Often",
            "value": 2
          },
          {
            "id": 4,
            "text": "Always",
            "value": 3
          }
        ]
      }
    ],
    "scoreBands": [
      {
        "id": 1,
        "label": "Low Risk",
        "minScore": 0,
        "maxScore": 5,
        "color": "green",
        "recommendation": "Continue monitoring your mental health"
      }
    ]
  }
}
```

### Error Response (404)
```json
{
  "success": false,
  "message": "Not found"
}
```

---

## 3. POST /assessments - Create Assessment

**Protected endpoint (authentication required)**

### Request
```http
POST /assessments
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Request Body
```json
{
  "title": "Anxiety Assessment",
  "subTitle": "Evaluate your anxiety levels",
  "imageUrl": "https://example.com/anxiety.jpg",
  "status": "active",
  "questions": [
    {
      "text": "How often do you experience excessive worry?",
      "order": 1,
      "options": [
        {
          "text": "Never",
          "value": 0
        },
        {
          "text": "Rarely",
          "value": 1
        },
        {
          "text": "Sometimes",
          "value": 2
        },
        {
          "text": "Often",
          "value": 3
        }
      ]
    }
  ],
  "scoreBands": [
    {
      "label": "Low Anxiety",
      "minScore": 0,
      "maxScore": 5,
      "color": "green",
      "recommendation": "Your anxiety levels are within normal range"
    },
    {
      "label": "Moderate Anxiety",
      "minScore": 6,
      "maxScore": 10,
      "color": "orange",
      "recommendation": "Consider speaking with a mental health professional"
    },
    {
      "label": "High Anxiety",
      "minScore": 11,
      "maxScore": 15,
      "color": "red",
      "recommendation": "Please seek immediate professional help"
    }
  ]
}
```

### Response (201)
```json
{
  "success": true,
  "data": {
    "id": 2,
    "title": "Anxiety Assessment",
    "subTitle": "Evaluate your anxiety levels",
    "imageUrl": "https://example.com/anxiety.jpg",
    "status": "active",
    "createdAt": "2024-01-15T11:00:00.000Z",
    "updatedAt": "2024-01-15T11:00:00.000Z",
    "questions": [...],
    "scoreBands": [...]
  }
}
```

### Validation Error Response (400)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "Title must be at least 3 characters",
    "Each question must have exactly 4 options"
  ]
}
```

---

## 4. PUT /assessments/:id - Update Assessment

**Protected endpoint (authentication required)**

### Request
```http
PUT /assessments/2
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Request Body (all fields optional)
```json
{
  "title": "Updated Anxiety Assessment",
  "status": "draft",
  "questions": [
    {
      "text": "Updated question text",
      "order": 1,
      "options": [
        {
          "text": "Never",
          "value": 0
        },
        {
          "text": "Rarely",
          "value": 1
        },
        {
          "text": "Sometimes",
          "value": 2
        },
        {
          "text": "Often",
          "value": 3
        }
      ]
    }
  ]
}
```

### Response (200)
```json
{
  "success": true,
  "data": {
    "id": 2,
    "title": "Updated Anxiety Assessment",
    "subTitle": "Evaluate your anxiety levels",
    "imageUrl": "https://example.com/anxiety.jpg",
    "status": "draft",
    "updatedAt": "2024-01-15T11:30:00.000Z",
    "questions": [...],
    "scoreBands": [...]
  }
}
```

### Error Response (404)
```json
{
  "success": false,
  "message": "Assessment not found"
}
```

---

## 5. DELETE /assessments/:id - Delete Assessment

**Protected endpoint (authentication required)**

### Request
```http
DELETE /assessments/2
Authorization: Bearer <jwt_token>
```

### Query Parameters
- `force` (optional): Set to `true` for hard delete (default: `false`)

**Example:**
```http
DELETE /assessments/2?force=true
```

### Response (200)
```json
{
  "success": true,
  "data": {
    "message": "Assessment deleted successfully"
  }
}
```

### Error Response (400)
```json
{
  "success": false,
  "message": "Cannot delete assessment with existing submissions"
}
```

### Error Response (404)
```json
{
  "success": false,
  "message": "Assessment not found"
}
```

---

## 6. POST /assessments/:id/submit - Submit Assessment Answers

**Protected endpoint (authentication required)**

### Request
```http
POST /assessments/1/submit
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Request Body
```json
{
  "answers": [
    {
      "questionId": 1,
      "value": 2
    },
    {
      "questionId": 2,
      "optionId": 5
    }
  ]
}
```

### Response (200)
```json
{
  "success": true,
  "data": {
    "submissionId": 123,
    "totalScore": 8,
    "band": {
      "label": "Moderate Anxiety",
      "color": "orange",
      "recommendation": "Consider speaking with a mental health professional"
    }
  }
}
```

### Error Response (400)
```json
{
  "success": false,
  "message": "Answer value must be 0..3"
}
```

---

## Data Validation Rules

### Assessment Creation/Update
| Field | Type | Validation | Required |
|-------|------|------------|----------|
| `title` | string | 3-200 characters | ✅ |
| `subTitle` | string | 5-400 characters | ❌ |
| `imageUrl` | any | any value | ❌ |
| `status` | string | "draft", "active", or "archived" | ❌ (defaults to "active") |
| `questions` | array | 1-20 questions | ✅ |
| `scoreBands` | array | 1-10 score bands | ✅ |

### Question Structure
| Field | Type | Validation | Required |
|-------|------|------------|----------|
| `text` | string | 5-500 characters | ✅ |
| `order` | integer | ≥ 1 | ✅ |
| `options` | array | exactly 4 options | ✅ |

### Option Structure
| Field | Type | Validation | Required |
|-------|------|------------|----------|
| `text` | string | 1-200 characters | ✅ |
| `value` | integer | 0-3 | ✅ |

### Score Band Structure
| Field | Type | Validation | Required |
|-------|------|------------|----------|
| `label` | string | 2-50 characters | ✅ |
| `minScore` | integer | ≥ 0 | ✅ |
| `maxScore` | integer | ≥ 0 | ✅ |
| `color` | string | "green", "blue", "orange", or "red" | ✅ |
| `recommendation` | string | ≤ 1000 characters | ❌ |

### Answer Submission
| Field | Type | Validation | Required |
|-------|------|------------|----------|
| `answers` | array | array of answer objects | ✅ |

**Answer Object Requirements:**
- Must have `questionId` + `value` (0-3) OR `questionId` + `optionId`
- All questions must be answered

---

## Error Responses

### Authentication Errors
```json
{
  "success": false,
  "message": "Access token is required"
}
```

```json
{
  "success": false,
  "message": "Token has expired. Please login again."
}
```

```json
{
  "success": false,
  "message": "Invalid access token"
}
```

### General Error Response
```json
{
  "success": false,
  "message": "Error message here"
}
```

---

## Frontend Implementation Notes

1. **Authentication**: Store JWT token securely and include in all protected requests
2. **Error Handling**: Always check the `success` field in responses
3. **Validation**: Implement client-side validation matching server rules
4. **Loading States**: Show loading indicators during API calls
5. **Error Display**: Display validation errors from the `errors` array
6. **Score Calculation**: The server automatically calculates scores and determines result bands
7. **Real-time Updates**: Use the assessment ID to fetch updated data after modifications

---

## Example Frontend Usage

### JavaScript/TypeScript Example
```javascript
// List all assessments
const response = await fetch('/assessments');
const { success, data } = await response.json();

// Create assessment
const createResponse = await fetch('/assessments', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(assessmentData)
});

// Submit answers
const submitResponse = await fetch(`/assessments/${assessmentId}/submit`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ answers: userAnswers })
});
```

This documentation provides all the information needed to create a complete frontend for the assessment system!

