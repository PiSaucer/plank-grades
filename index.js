document.getElementById('myForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the default form submission
    removeBootstrapAlert(); // Remove any existing alert
    
    // Get form data
    var formData = new FormData(this);
    
    // Convert formData to JSON
    var jsonData = {};
    formData.forEach(function(value, key) {
        jsonData[key] = value;
    });

    // Do something with the data (For demonstration purpose, just log it)
    console.log(jsonData);

    var semesterFilePath = "data/" + jsonData.semester + ".json";
    fetchDataFile(semesterFilePath, function(curve) {
        var labs = jsonData.labs;
        var missedDays = jsonData.participation;
        var curvedMidterm = convertScore(curve.midterm, jsonData.midterm);
        if (curvedMidterm == "Invalid score") {
            bootstrapAlert("Invalid midterm score", "danger");
            return;
        }
        document.getElementById('curvedmidterm').value = parseFloat(curvedMidterm).toFixed(2);

        if (jsonData.testFinal && !curve.hasOwnProperty('final')) {
            let testfinalCurve = {
                "top": 100,
                "a": 90,
                "b": 80,
                "c": 70,
                "d": 60
            };

            var curvedFinal = convertScore(testfinalCurve, jsonData.final);
            if (curvedFinal == "Invalid score") {
                bootstrapAlert("Invalid final score", "danger");
                return;
            }
            document.getElementById('curvedfinal').value = parseFloat(curvedFinal).toFixed(2);

            // Calculate final grade
            let grade = {labs, missedDays, curvedMidterm, curvedFinal};
            document.getElementById('finalgrade').value = parseFloat(finalGrade(grade)).toFixed(2);
        } else if (jsonData.testFinal) {
            var curvedFinal = convertScore(curve.final, jsonData.final);
            if (curvedFinal == "Invalid score") {
                bootstrapAlert("Invalid final score", "danger");
                return;r
            }
            document.getElementById('curvedfinal').value = parseFloat(curvedFinal).toFixed(2);

            // Calculate final grade
            let grade = {labs, missedDays, curvedMidterm, curvedFinal};
            document.getElementById('finalgrade').value = parseFloat(finalGrade(grade)).toFixed(2);
        } else {
            // Calculate final grade
            let grade = {labs, missedDays, curvedMidterm};
            document.getElementById('finalgrade').value = parseFloat(finalGrade(grade)).toFixed(2);
        }
    });
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

function fetchDataFile(filePath, callback) {
    fetch(filePath)
        .then(response => response.json())
        .then(data => callback(data))
        .catch(error => {
            console.error('Error fetching test object:', error);
            bootstrapAlert("Invalid semester", "danger");
        });
}

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