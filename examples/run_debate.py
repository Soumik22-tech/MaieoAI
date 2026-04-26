import json
import os
from maieo.core.debate import DebateSession
from maieo.cli import print_pretty_result

def main():
    query = "Is Python the best language for AI development?"
    print(f"Running sample debate with query: '{query}'\n")
    
    session = DebateSession()
    result = session.run(query)
    
    print_pretty_result(result)
    
    output_path = os.path.join(os.path.dirname(__file__), "output.json")
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(result.to_dict(), f, indent=2)
        
    print(f"\nResult saved to {output_path}")

if __name__ == "__main__":
    main()
