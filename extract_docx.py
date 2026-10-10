import zipfile
import re
from pathlib import Path

docx_path = Path('d:/My Projects/DietAndWell/DietAndWell_Agent_Master_Reference.docx')

try:
    with zipfile.ZipFile(docx_path, 'r') as zip_ref:
        xml_content = zip_ref.read('word/document.xml').decode('utf-8')
    
    # Extract all text elements
    text_elements = re.findall(r'<w:t[^>]*>(.*?)</w:t>', xml_content, re.DOTALL)
    
    # Join and clean up
    full_text = ''.join(text_elements)
    full_text = re.sub(r'\s+', ' ', full_text)  # Normalize whitespace
    
    print(full_text)
    
except Exception as e:
    print(f"Error: {e}")
