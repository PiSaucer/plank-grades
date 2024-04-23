import os
import json

def collect_courses(directory):
    courses = {}
    for root, dirs, files in os.walk(directory):
        for filename in files:
            if filename.endswith(".json") and filename != "data.json":  # Exclude "data.json"
                print(f"Found {os.path.join(root, filename)}")
                course_name = os.path.basename(root)
                if course_name not in courses:
                    courses[course_name] = []
                courses[course_name].append(filename[:-5])  # Exclude the last 5 characters (.json)
    return courses

def main():
    directory = "."  # Assuming the script is in the directory containing the course folders
    courses = collect_courses(directory)
    with open("data.json", "w") as outfile:
        json.dump(courses, outfile, indent=4)

if __name__ == "__main__":
    main()
