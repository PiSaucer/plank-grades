#!/bin/sh

# Check if pip is installed
if ! command -v pip &> /dev/null
then
    echo "pip could not be found"
    exit
fi

# Check if python is installed
if ! command -v python &> /dev/null
then
    echo "python could not be found"
    exit
fi

# If both are installed, proceed with package installation
pip install -r requirements.txt
