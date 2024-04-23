# Function Documentation

## `convertScore(curve, score)`

**Parameters:**

* `curve`: Object containing grade curve data, including top score and grade thresholds.
* `score`: The raw score to be converted.

**Use Case:** Converts a raw score to a curved score based on the provided curve data.

**Example Code:**

```javascript
var curve = {
    "top": 100,
    "a": 90,
    "b": 80,
    "c": 70,
    "d": 60
};
var rawScore = 75;
var curvedScore = convertScore(curve, rawScore);
console.log(curvedScore); // Output: 75
```

## `finalGrade(grade)`

**Parameters:**

* `grade`: Object containing grade components like labs, missed days, and curved scores.
* `Use Case`: Calculates the final grade based on components including attendance deductions.

**Use Case:** Calculates the final grade based on components including attendance deductions.

**Example Code:**

```javascript
var grade = {
    labs: 85,
    missedDays: 4,
    curvedMidterm: 80,
    curvedFinal: 75
};
var finalGradeValue = finalGrade(grade);
console.log(finalGradeValue); // Output: 81.25
```

## `calculateGrade(curve, jsonData)`

**Parameters:**

* `curve`: Object containing grade curve data, including top score and grade thresholds.
* `jsonData`: Object containing form data.

**Use Case:** Calculates the final grade based on form data, including midterm, final exam, labs, and attendance.

**Example Code:**

```javascript
var curve = { 
    midterm: { "top": 85, "a": 60, "b": 50, "c": 40, "d": 30 },
    final: { "top": 100, "a": 69, "b": 57, "c": 42, "d": 32 }
};

var formData = { class: 'cs202', semester: 'Spring 2023', midterm: 75, final: 80, labs: 90, participation: 3 };
calculateGrade(curve, formData); // Doesn't return anything
```

## `calculateAttendanceDeduction(jsonData)`

**Parameters:**

* `jsonData`: Object containing form data.
  
**Use Case:** Calculates attendance deductions based on class and lab attendance.

**Example Code:**

```javascript
var formData = { class: 'cs202', participation: 7 };
var deduction = calculateAttendanceDeduction(formData);
console.log(deduction); // Output: 2
```

## `updateAttendanceVariables(jsonData)`

**Parameters:**

* `jsonData`: Object containing form data.

**Use Case:** Updates global variables tracking attendance based on form data.

**Example Code:**

```javascript
var formData = { class: 'cs202', participation: 7 };
updateAttendanceVariables(formData);
```

## `getGradeLetter(value)`

**Parameters:**

* `value`: The numerical value of the final grade.

**Use Case:** Retrieves the letter grade corresponding to the numerical grade.

**Example Code:**

```javascript
var numericalGrade = 85;
getGradeLetter(numericalGrade)
.then(grade => {
    console.log(grade); // Output: B+
})
.catch(error => {
    console.error('Error:', error);
});
```

## `fetchDataFile(filePath, callback)`

**Parameters:**

* `filePath`: The path to the data file to fetch.
* `callback`: The callback function to handle the fetched data.

**Use Case:** Fetches data from a specified file path and passes it to a callback function.

**Example Code:**

```javascript
var filePath = 'data/cs202/2023-spring.json';
fetchDataFile(filePath, function(data) {
    console.log(data); // Output: { object }
});

var result = {
    class: 'CS 202',
    semester: 'Spring 2023',
    midterm: { top: 85, a: 60,b: 50,c: 40,d: 30 },
    final: { top: 100, a: 69, b: 57, c: 42, d: 32 }
};
```
