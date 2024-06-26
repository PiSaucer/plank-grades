import os
import json

# List of files to exclude
EXCLUDE_FILES = ["data.json", "data.old.json", "grade_scale.json"]

def collect_courses(directory):
    courses = {}
    for root, dirs, files in os.walk(directory):
        for filename in files:
            if filename.endswith(".json") and filename not in EXCLUDE_FILES:  # Exclude specified files
                print(f"Found {os.path.join(root, filename)}")
                course_name = os.path.basename(root)
                if course_name not in courses:
                    courses[course_name] = []
                courses[course_name].append(filename)

    # Sort the courses dictionary based on course name and file name
    sorted_courses = {}
    for course, files in courses.items():
        sorted_files = sorted(files, key=lambda x: (x.split('-')[0], x.split('-')[1]), reverse=True)
        sorted_courses[course] = sorted_files
    sorted_courses = dict(sorted(sorted_courses.items(), key=lambda x: x[0], reverse=True))  # Sort by course name in reverse order
    return sorted_courses

def main():
    directory = "."  # Assuming the script is in the directory containing the course folders
    courses = collect_courses(directory)
    with open("data.json", "w") as outfile:
        json.dump(courses, outfile, indent=4)

if __name__ == "__main__":
    main()
