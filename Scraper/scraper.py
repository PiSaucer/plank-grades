import requests
from bs4 import BeautifulSoup
import json
import re

# Function to fetch webpage content
def fetch_webpage(url):
    response = requests.get(url)
    if response.status_code == 200:
        return response.content
    else:
        return None

def extract_data(html_content, semester):
    # Use BeautifulSoup to parse HTML
    soup = BeautifulSoup(html_content, 'html.parser')
    
    # Search for patterns matching score entries
    score_pattern = r'([A-F])\s*:\s*(\d+)\s*-\s*(\d+)'
    score_entries = re.findall(score_pattern, soup.get_text())
    
    # If no score entries are found, return None
    if not score_entries:
        print(f"No valid score entries found for {semester}. Skipping...")
        return None
    
    # Construct grade ranges dictionary
    grade_ranges = {}
    for grade, min_score, _ in score_entries:
        if grade != 'F':  # Skip F grade
            grade_ranges[grade.lower()] = int(min_score)
    
    # Construct JSON data
    top_score = max(int(max_score) for _, _, max_score in score_entries)
    data = {
        "semester": f"{semester.split()[1]} {semester.split()[0]}",
        "midterm": {
            "top": top_score,
            **grade_ranges
        }
    }
    
    return data

# Function to save data into JSON file
def save_as_json(data, filename):
    with open(filename, 'w') as json_file:
        json.dump(data, json_file, indent=4)

def main():
    # Read URLs from file
    with open("urls.txt", "r") as file:
        urls = file.readlines()
    
    for url in urls:
        url = url.strip()  # Remove leading/trailing whitespace and newline characters
        semester = url.split('/')[-2].replace('_', ' ').title()
        html_content = fetch_webpage(url)
        if html_content:
            data = extract_data(html_content, semester)
            if data:
                filename = f"{semester.split()[0]}-{semester.split()[1].lower()}.json"
                save_as_json(data, filename)
                print(f"Data for {semester} saved successfully as {filename}!")
            else:
                print(f"No data extracted for {semester}. Skipping...")
        else:
            print(f"Failed to fetch webpage: {url}")

if __name__ == "__main__":
    main()

if __name__ == "__main__":
    main()
