// Global variables to track attendance deductions
var classMissed = 0;
var labMissed = 0;

document.getElementById('myForm').addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent the default form submission
    removeBootstrapAlert(); // Remove any existing alert

    // Get form data
    var formData = new FormData(this);

    // Convert formData to JSON
    var jsonData = {};
    formData.forEach(function (value, key) {
        jsonData[key] = value;
    });

    // Log the JSON data
    console.log(jsonData);

    var semesterFilePath = "data/" + jsonData.class + "/" + jsonData.semester;
    var file = document.getElementById('fileupload').files[0]; // Get the uploaded file

    if (file) {
        var reader = new FileReader();
        reader.onload = function (e) {
            var curve = JSON.parse(e.target.result); // Parse the file content to JSON
            calculateGrade(curve, jsonData); // Call the function to calculate the grade
        };
        reader.readAsText(file); // Read the file content
    } else {
        fetchDataFile(semesterFilePath, function (curve) {
            calculateGrade(curve, jsonData);
        });
    }
});

function convertScore(curve, score) {
    const { top, a, b, c, d } = curve;
    const s = score;

    if (s >= a && s <= top) {
        return 90 + 10 * (s - a) / (top - a);
    } else if (s >= b && s < a) {
        return 80 + 10 * (s - b) / (a - b);
    } else if (s >= c && s < b) {
        return 70 + 10 * (s - c) / (b - c);
    } else if (s >= d && s < c) {
        return 60 + 10 * (s - d) / (c - d);
    } else if (s >= 0 && s < d) {
        return 60 * s / d;
    } else {
        return "Invalid score";
    }
}

function finalGrade(grade) {
    const { labs, missedDays, curvedMidterm, curvedFinal } = grade;
    var final;
    let deducted = 0;
    if (curvedFinal) {
        final = (0.5 * ((curvedMidterm + curvedFinal) / 2)) + (0.5 * labs);
    } else {
        final = (0.5 * curvedMidterm) + (0.5 * labs);
    }

    if (missedDays > 6) deducted = (missedDays - 6);
    return final - (deducted * 2);
}

function calculateGrade(curve, jsonData) {
    updateAttendanceVariables(jsonData);
    var attendanceDeduction = calculateAttendanceDeduction(jsonData);
    var labs = parseFloat(jsonData.labs);
    var missedDays = jsonData.participation;

    if (jsonData.lab0) labs = ((labs + parseFloat(jsonData.lab0)) / 2);
    if (jsonData.tnvoice) labs += 3.0;

    var curvedMidterm = convertScore(curve.midterm, jsonData.midterm);
    if (curvedMidterm == "Invalid score") {
        bootstrapAlert("Invalid midterm score", "danger");
        return;
    }
    document.getElementById('curvedmidterm').value = parseFloat(curvedMidterm).toFixed(2);

    if (jsonData.testFinal) {
        // Check if final curve is provided
        if (!curve.hasOwnProperty('final')) {
            let testfinalCurve = {
                "top": 100,
                "a": 90,
                "b": 80,
                "c": 70,
                "d": 60
            };
        }

        var curvedFinal = convertScore(curve.final, jsonData.final);
        if (curvedFinal == "Invalid score") {
            bootstrapAlert("Invalid final score", "danger");
            return; r
        }
        document.getElementById('curvedfinal').value = parseFloat(curvedFinal).toFixed(2);

        // Calculate final grade including attendance deduction
        let grade = { labs, missedDays, curvedMidterm, curvedFinal };
        var finalGradeValue = parseFloat(finalGrade(grade)).toFixed(2);
        finalGradeValue -= attendanceDeduction;
        
        getGradeLetter(finalGradeValue) .then(grade => {
            document.getElementById('finalgrade').value = `${finalGradeValue} ${grade}`
        }).catch(error => {
            console.error('Error:', error);
            bootstrapAlert("Error fetching grade scale", "danger");
        });
    } else {
        // Calculate final grade including attendance deduction
        let grade = { labs, missedDays, curvedMidterm };
        var finalGradeValue = parseFloat(finalGrade(grade)).toFixed(2);
        finalGradeValue -= attendanceDeduction;

        getGradeLetter(finalGradeValue).then(grade => {
            document.getElementById('finalgrade').value = `${finalGradeValue} ${grade}`
        }).catch(error => {
            console.error('Error:', error);
            bootstrapAlert("Error fetching grade scale", "danger");
        });
    }
}

// Function to calculate attendance deductions
function calculateAttendanceDeduction(jsonData) {
    // Check class attendance deduction
    if (classMissed > 6) classMissed = 6;

    // Check lab attendance deduction for specific classes
    if (['CS202', 'CS302'].includes(jsonData.class)) {
        if (labMissed > 1) labMissed = 1;
    }

    // Calculate total attendance deduction
    var totalDeduction = (classMissed + labMissed) * 2;
    if (totalDeduction > 10) totalDeduction = 10;
    return totalDeduction;
}

// Function to update attendance variables based on form data
function updateAttendanceVariables(jsonData) {
    // Increment classMissed for each class missed
    if (jsonData.participation === 'absent') classMissed++;

    // Increment labMissed for each lab missed for specific classes
    if (['CS202', 'CS302'].includes(jsonData.class)) {
        if (jsonData.labParticipation === 'absent') {
            labMissed++;
        }
    }
}

function getGradeLetter(value) {
    return new Promise((resolve, reject) => {
        fetch('data/grade_scale.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(gradeScale => {
                for (const grade in gradeScale) {
                    const range = gradeScale[grade];
                    if (value >= range.min && value <= range.max) {
                        resolve(grade);
                        return;
                    }
                }
                resolve("Unknown");
            })
            .catch(error => {
                console.error('Error fetching or parsing JSON:', error);
                reject(error);
            });
    });
}

function fetchDataFile(filePath, callback) {
    fetch(filePath).then(response => response.json())
    .then(data => callback(data))
    .catch(error => {
        console.error('Error fetching test object:', error);
        bootstrapAlert("Invalid semester", "danger");
    });
}

document.getElementById('fileupload').addEventListener('change', function (event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    if (file) {
        reader.onload = function (event) {
            const jsonData = JSON.parse(event.target.result);
            console.log(jsonData);

            // Bootstrap alert
            var alert = document.getElementById('uploadAlert');
            alert.classList.add('alert', 'alert-' + 'success');
            alert.textContent = "File uploaded successfully";
            document.getElementById('uploadAlert').appendChild(alert);
        };

        reader.readAsText(file);
    } else {
        // No file is selected, reload the page
        location.reload();
    }
});

function bootstrapAlert(message, type) {
    var alert = document.createElement('div');
    alert.classList.add('alert', 'alert-' + type);
    alert.textContent = message;
    document.getElementById('alert').appendChild(alert);
}

function removeBootstrapAlert() {
    var alertElement = document.getElementById('alert');
    while (alertElement.firstChild) {
        alertElement.removeChild(alertElement.firstChild);
    }
}

function enableFinalInput() {
    var checkbox = document.getElementById('testFinal');
    var finalInput = document.getElementById('final');
    var curvedfinal = document.getElementById('curvedfinal');

    if (checkbox.checked) {
        finalInput.disabled = false;
    } else {
        finalInput.disabled = true;
        finalInput.value = "";
        curvedfinal.value = "";
    }
}

function enableLab0() {
    var checkbox = document.getElementById('checklab0');
    var lab0 = document.getElementById('lab0');
    var row = document.getElementById('lab0row');

    if (checkbox.checked) {
        lab0.disabled = false;
        row.classList.remove('hide');
    } else {
        lab0.disabled = true;
        lab0.value = "";
        row.classList.add('hide');
    }
}

document.addEventListener('DOMContentLoaded', function () {
    fetch('data/data.json')
        .then(response => response.json())
        .then(data => {
            let classSelect = document.getElementById('class');
            let semesterSelect = document.getElementById('semester');

            // Function to update semester options based on selected class
            function updateSemesterOptions() {
                let selectedClass = classSelect.value;

                // Clearing the existing options
                semesterSelect.innerHTML = '';

                // Iterating over the array of semesters for the selected class
                data[selectedClass].forEach(semester => {
                    // Creating new option element for semester
                    let semesterOption = document.createElement('option');
                    // Setting value and text for option
                    semesterOption.value = semester;
                    // Remove '.json' from the semester string
                    let formattedSemester = semester.replace('.json', '');
                    // Display as '2023 Spring'
                    let year = formattedSemester.split('-')[0];
                    let season = formattedSemester.split('-')[1];
                    season = season.charAt(0).toUpperCase() + season.slice(1);
                    semesterOption.text = `${year} ${season}`;
                    // Adding options to the select element
                    semesterSelect.add(semesterOption);
                });
            }

            // Clearing the existing options
            classSelect.innerHTML = '';

            // Iterating over the object properties (classes)
            for (let className in data) {
                // Creating new option element for class
                let classOption = document.createElement('option');
                // Setting value and text for option
                classOption.value = className;
                classOption.text = className.toUpperCase(); // Display as 'CS302'
                // Adding options to the select element
                classSelect.add(classOption);
            }

            // Update semester options when a class is selected
            classSelect.addEventListener('change', updateSemesterOptions);

            // Initial population of semester options
            updateSemesterOptions();
        })
        .catch(error => console.error('Error:', error));
});
