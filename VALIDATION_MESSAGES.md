# Parking Management System (Admin)- Validation Messages

This document contains all error and success messages used throughout the PMS Frontend Admin application.

## Add Site Form Messages

### Name (EN) Field Validation

**Required Field Error:**
- "This field is required"

**Length Validation Error:**
- "The site name must contain number of characters in the range 3 to 100 characters"

**Format Validation Error:**
- "Only English letters, numbers, and basic punctuation are allowed"

**Uniqueness Validation Error:**
- "This name is already in use"

### Name (AR) Field Validation

**Required Field Error:**
- "This field is required"

**Length Validation Error:**
- "The site name must contain number of characters in the range 3 to 100 characters"

**Format Validation Error:**
- "Only Arabic letters, numbers, and basic punctuation are allowed"

**Uniqueness Validation Error:**
- "This name is already in use"

### Price per Hour Field Validation (Leaf Sites Only)

**Required Field Error:**
- "This field is required"

**Value Range Errors:**
- "Price must be greater than 0"
- "Price cannot exceed 999.99"

**Format Validation Error:**
- "Price must have exactly 2 decimal places (e.g., 5.00, 10.50)"

**Valid Examples:** `5.00`, `10.50`, `99.99`, `999.99`

**Invalid Examples:** `5`, `5.5`, `5.555`, `1000.00`, `0`, `-5.00`

### Integration Code Field Validation (Leaf Sites Only)

**Required Field Error:**
- "This field is required"

**Length Validation Errors:**
- "Minimum length is 3 characters"
- "Maximum length is 100 characters"

**Format Validation Error:**
- "Only letters, numbers, hyphens, spaces, and underscores are allowed"

**Uniqueness Validation Error:**
- "This integration code is already in use"

**Valid Examples:** `MAIN_A01`, `Zone-B-01`, `Parking Area 1`, `LOT_001`

**Invalid Examples:** `AB`, `A@B`, `Code#123`, `Test!Code`

### Number of Slots Field Validation (Leaf Sites Only)

**Required Field Error:**
- "This field is required"

**Value Range Errors:**
- "Minimum value is 1"
- "Maximum value is 10000"

**Valid Range:** 1 - 10,000

### Polygon Requirement (Leaf Sites Only)

**Missing Polygon Warning:**
- "Polygon must be added before saving a leaf site"

---

## Polygon Form Messages

### Polygon Name Field Validation

**Required Field Error:**
- "This field is required"

**Length Validation Error:**
- "The polygon name must contain number of characters in the range 3 to 100 characters"

**Format Validation Error:**
- "Only Arabic/English letters, numbers, and basic punctuation are allowed"

**Uniqueness Validation Error:**
- "This polygon name is already in use"

### Coordinates Validation

**Minimum Points Error:**
- "At least 3 coordinate points are required"

**General Validation Error:**
- "Please fix the validation errors before saving"

### Latitude Field Validation

**Required Field Error:**
- "This field is required"

**Format Errors:**
- "Invalid number"

**Range Error:**
- "Range: -90 to +90"

**Precision Error:**
- "Max 6 decimal places"

**Valid Range:** -90.000000 to +90.000000

### Longitude Field Validation

**Required Field Error:**
- "This field is required"

**Format Errors:**
- "Invalid number"

**Range Error:**
- "Range: -180 to +180"

**Precision Error:**
- "Max 6 decimal places"

**Valid Range:** -180.000000 to +180.000000

### Form-Level Validation Messages

**General Form Validation:**
- "Fill all required fields" (shown when save/update is clicked with empty required fields)

---

## Success Messages

### Site Operations

**Site Created:**
- Navigation to dashboard with new site selected (no text message)

**Site Updated:**
- Navigation to dashboard with updated site selected (no text message)

### Polygon Operations

**Polygon Created:**
- "Polygon saved successfully!"
- Display: Toast notification (1.5 seconds)

**Polygon Updated:**
- "Polygon updated successfully!"
- Display: Toast notification (1.5 seconds)

---

## Info Messages

### Site Creation Guidance

**No Parent Site Selected:**
- "This will be created as a Parent Site. To create a Leaf Site, use the '+' button next to a parent site in the tree."


## Validation Rules Summary

### Field Requirements by Site Type

#### Parent Sites
- **Name (EN)** - Required, 3-100 chars, English only
- **Name (AR)** - Required, 3-100 chars, Arabic only
- **Price per Hour** - Not applicable
- **Integration Code** - Not applicable
- **Number of Slots** - Not applicable
- **Polygon** - Not applicable

#### Leaf Sites
- **Name (EN)** - Required, 3-100 chars, English only
- **Name (AR)** - Required, 3-100 chars, Arabic only
- **Price per Hour** - Required, 0.01-999.99, exactly 2 decimals
- **Integration Code** - Required, 3-100 chars, specific format
- **Number of Slots** - Required, 1-10000
- **Polygon** - Required, minimum 3 coordinates

### Polygon Requirements
- **Polygon Name** - Required, 3-100 chars, mixed Arabic/English
- **Coordinates** - Minimum 3 points required
- **Latitude** - Required, -90 to +90, max 6 decimals
- **Longitude** - Required, -180 to +180, max 6 decimals