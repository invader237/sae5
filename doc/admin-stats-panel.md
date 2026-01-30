# Documentation: Admin Panel Statistics and Charts

This documentation explains how the statistics and charts displayed in the NeuRoom application's admin panel work.

## Overview

The statistics panel (`ModelStatsPanel`) allows administrators to visualize the performance of the room recognition model. It consists of two levels:

1. **Summary (KPIs)** - Displayed directly in the admin panel
2. **Detailed statistics** - Accessible via a modal with advanced charts

---

## Architecture

### File Structure

| Layer | File | Role |
|-------|------|------|
| **Frontend** | `components/model-stats-panel/ModelStatsPanel.tsx` | Display component |
| **Frontend** | `hooks/models/useModelStats.ts` | Data loading hook |
| **Frontend** | `api/model.api.ts` | API calls |
| **Backend** | `app/model/domain/service/model_stats_service.py` | Calculation logic |
| **Backend** | `app/model/infra/rest/model_router.py` | API endpoints |

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/models/{model_id}/stats/summary` | Retrieves the summary (KPIs) |
| GET | `/models/{model_id}/stats/detailed` | Retrieves detailed statistics |

> ⚠️ These endpoints require the **admin** role.

---

## 1. Summary Statistics (KPIs)

### Displayed Data

| KPI | Description |
|-----|-------------|
| **Validated images** | Total number of validated images for this model |
| **Average score** | Average recognition score (in %) |

### How are these statistics calculated?

The system retrieves data by joining the `Picture` and `History` tables via `image_id`:

1. **Validated images**: Count distinct `Picture.image_id` where:
   - `History.model_id` matches the selected model
   - `Picture.is_validated = TRUE`

2. **Average score**: Calculate the average of `Picture.recognition_percentage` for these same images (taking the max score per image).

### Frontend Display

- **Blue card**: Number of validated images
- **Green card**: Average score as percentage

---

## 2. Detailed Statistics

Accessible by clicking "View detailed statistics".

| Data | Description |
|------|-------------|
| **Global accuracy** | Percentage of correct predictions |
| **Confusion matrix** | Comparison of actual vs predicted rooms |
| **Time evolution** | Chart showing accuracy evolution over time |

---

## 3. Global Accuracy

### Definition

Global accuracy measures the percentage of times the model correctly identified the room.

### Calculation

A prediction is **correct** when:

> `History.room_id` (predicted room) **=** `Picture.room_id` (actual validated room)

**Formula**: `Accuracy = (number of correct predictions / total validated predictions) × 100`

### Filtering Conditions

- `History.model_id` = selected model
- `Picture.is_validated = TRUE`
- `History.room_id` and `Picture.room_id` are not NULL

### Display (Gauge)

| Accuracy | Color | Message |
|----------|-------|---------|
| ≥ 80% | 🟢 Green | "Excellent performance" |
| 50-79% | 🟡 Yellow | "Acceptable performance" |
| < 50% | 🔴 Red | "Performance needs improvement" |

---

## 4. Confusion Matrix

### Definition

The confusion matrix is a table that shows the correspondence between:
- **Rows**: The actual room (`Picture.room_id` - validated by user)
- **Columns**: The predicted room (`History.room_id` - predicted by model)

### Visual Example

|  | Room A (predicted) | Room B (predicted) | Room C (predicted) |
|--|-------------------|-------------------|-------------------|
| **Room A (actual)** | 🟢 45 | 🔴 3 | 🔴 2 |
| **Room B (actual)** | 🔴 5 | 🟢 38 | 🔴 7 |
| **Room C (actual)** | 🔴 1 | 🔴 4 | 🟢 46 |

- **Diagonal (green)**: Correct predictions (`Picture.room_id == History.room_id`)
- **Off-diagonal (red)**: Classification errors

### How is the data retrieved?

Data is grouped by pair (`Picture.room_id`, `History.room_id`) and the number of occurrences for each combination is counted.

### Frontend Display

- **Green** for diagonal (correct predictions)
- **Red** for errors
- Intensity proportional to number of occurrences
- **Limit**: Maximum 15 rooms displayed

---

## 5. Accuracy Evolution Over Time

### Definition

This chart shows how the model's accuracy evolves day by day.

### How is the data aggregated?

Data is grouped by **validation day** (`Picture.validation_date`), then for each day we calculate:

1. **Total**: Number of validated predictions that day
2. **Correct**: Number where `History.room_id == Picture.room_id`
3. **Accuracy**: `correct / total`

### Display (Line Chart)

- **Y-axis**: Accuracy from 0% to 100%
- **X-axis**: Dates
- **Limit**: Maximum 30 most recent days displayed

---

## 6. Data Refresh

Statistics are automatically refreshed when:
1. The selected model changes
2. A validation is performed in the PVA Panel
3. The details modal is opened

---

## 7. Entity Relationships

### Simplified Schema

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   Model     │       │   History   │       │   Picture   │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id (PK)     │◄──────│ model_id    │       │ image_id    │
│ name        │       │ image_id    │──────►│ room_id     │
│ is_active   │       │ room_id     │       │ is_validated│
└─────────────┘       │ (predicted) │       │ validation_ │
                      └─────────────┘       │   date      │
                                            │ recognition_│
                      ┌─────────────┐       │   percentage│
                      │    Room     │       └─────────────┘
                      ├─────────────┤              │
                      │ room_id (PK)│◄─────────────┘
                      │ name        │     (actual room)
                      └─────────────┘
```
---

## 8. Error Handling

### Frontend Side

| State | Display |
|-------|---------|
| Loading | Spinner |
| No data | Explanatory message |
| No validated images | Prompt to validate images |

### Backend Side

| Code | Meaning |
|------|---------|
| `401` | Not authenticated |
| `403` | Not admin role |
| `500` | Calculation error |

---

## 9. Important Notes

### Performance

- **Summary**: Lightweight, automatically loaded when model is selected
- **Detailed**: Heavier, only loaded when modal is opened

### Data Filtering

Only **validated** images (`is_validated = TRUE`) are taken into account. Images without an associated room (`room_id = NULL`) are excluded from accuracy calculations and the confusion matrix.
