import os
import json

def collect_courses(directory):
    courses = {}
    for root, dirs, files in os.walk(directory):
        for filename in files:
            if filename.endswith(".json") and filename != "data.json" and filename != "data.old.json":  # Exclude "data.json"
                print(f"Found {os.path.join(root, filename)}")
                course_name = os.path.basename(root)
                if course_name not in courses:
                    courses[course_name] = []
                courses[course_name].append(filename)

    # Sort the courses dictionary based on course name and file name
    sorted_courses = {course: sorted(files, key=lambda x: (x.split('-')[0], x.split('-')[1]), reverse=True) for course, files in courses.items()}
    sorted_courses = dict(sorted(sorted_courses.items(), key=lambda x: x[0], reverse=True))  # Sort by course name in reverse order
    return sorted_courses

def main():
    directory = "."  # Assuming the script is in the directory containing the course folders
    courses = collect_courses(directory)
    with open("data.json", "w") as outfile:
        json.dump(courses, outfile, indent=4)

if __name__ == "__main__":
    main()
