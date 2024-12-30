import React, { useState } from "react";
import axios from "axios";
import catalogFile from "./onsite_documents/unique_fastener_catalog.csv";
import AWS from "aws-sdk";

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [extractedItems, setExtractedItems] = useState([]);
  const [matches, setMatches] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [catalog, setCatalog] = useState([]);
  const [editedMappings, setEditedMappings] = useState({});
  const [saveSuccess, setSaveSuccess] = useState(false);


  AWS.config.update({
    region: "us-east-1",
    accessKeyId: "",
    secretAccessKey: "",
  });
  const dynamoDb = new AWS.DynamoDB.DocumentClient();

  // const loadCatalog = () => {
  //   fetch(catalogFile)
  //     .then((response) => response.text())
  //     .then((text) => {
  //       const lines = text.split("\n").slice(1); // Skip the header row
  //       const catalogData = lines.map((line) => {
  //         const [Type, Material, Size, Length, Coating, ThreadType, Description] = line.split(",");
  //         return { Type, Material, Size, Length, Coating, ThreadType, Description };
  //       });
  //       setCatalog(catalogData);
  //     })
  //     .catch((error) => {
  //       console.error("Error loading catalog:", error);
  //     });
  // };

  // React.useEffect(() => {
  //   loadCatalog();
  // }, []);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    setFileName(file?.name || ""); 
  };

  const handleExtract = async () => {
    if (selectedFile === null) {
      alert("Please upload a file first.");
      return;
    }

    const apiUrl = "https://plankton-app-qajlk.ondigitalocean.app/extraction_api";

    const formData = new FormData();
    formData.append("file", selectedFile, selectedFile.name);

    try {
      const response = await axios.post(apiUrl, formData, {
        headers: {
          accept: "application/json",
          "Content-Type": "multipart/form-data",
        },
      });

      const extractedData = response.data.line_items || [];
      setExtractedItems(extractedData);
    } catch (error) {
      console.error("Error:", error.response?.status, error.response?.data);
    }

    const mockedExtractedItems = [
      {
        "Request Item": "Brass Nut 1/2\" 20mm Galvanized Coarse",
        "Amount": 143,
        "Unit Price": "",
        "Total": ""
      },
      {
        "Request Item": "Stainless Steel Stud M6 10mm Galvanized Wood",
        "Amount": 364,
        "Unit Price": "",
        "Total": ""
      },
      {
        "Request Item": "Aluminum Screw M10 30mm Nickel Plated Fine",
        "Amount": 458,
        "Unit Price": "",
        "Total": ""
      },
      {
        "Request Item": "Steel Washer M6 20mm Uncoated Machine",
        "Amount": 612,
        "Unit Price": "",
        "Total": ""
      },
      {
        "Request Item": "Stainless Steel Nut M5 50mm Nickel Plated Coarse",
        "Amount": 503,
        "Unit Price": "",
        "Total": ""
      }
    ];
    setExtractedItems(mockedExtractedItems);
  };

  const handleMatch = async () => {
    const apiUrl = "https://endeavor-interview-api-gzwki.ondigitalocean.app/match/batch?limit=5";

    const queries = extractedItems.map((item) => item["Request Item"]);
    const requestBody = { queries };

    try {
      const response = await axios.post(apiUrl, requestBody, {
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      const matchData = response.data.results || {};
      const defaultMappings = {};
      queries.forEach((query) => {
        if (matchData[query]?.length > 0) {
          defaultMappings[query] = matchData[query][0].match;
        }
      });

      setMatches(matchData);
      setEditedMappings(defaultMappings);
    } catch (error) {
      console.error("Error:", error.response?.status, error.response?.data);
    }
  };

  const handleEditMapping = (query, newValue) => {
    setEditedMappings((previousMappings) => ({
      ...previousMappings,
      [query]: newValue
    }));
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSaveChanges = async () => {
    const updatedMappings = {
      ...editedMappings,
      fileName: fileName, // Add fileName as a property
    };
  
    console.log("Save Changes button clicked!");
    console.log(updatedMappings);

    const params = {
      TableName: "UserMappings", // Replace with your DynamoDB table name
      Item: {
        fileName: fileName, // Partition key
        data: updatedMappings, // Store the entire updatedMappings object
      },
    };
  
    try {
      await dynamoDb.put(params).promise();
      console.log("Data successfully saved to DynamoDB!");
      setSaveSuccess(true); 
    } catch (error) {
      console.error("Error saving to DynamoDB:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="container mx-auto bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-700 mb-6">Automated Document Processor</h1>
  
        {saveSuccess ? (
          <div className="flex flex-col items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-20 w-20 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
            <h2 className="text-xl font-semibold text-gray-700 mt-4">Data Saved Successfully!</h2>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-600">Upload Document:</label>
              <input
                type="file"
                onChange={handleFileUpload}
                className="mt-2 block w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
  
            <div className="flex gap-4 mb-6">
              <button
                onClick={handleExtract}
                disabled={!selectedFile}
                className={`px-4 py-2 rounded-md ${
                  !selectedFile
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
              >
                Extract Line Items
              </button>
              <button
                onClick={handleMatch}
                disabled={extractedItems.length === 0}
                className={`px-4 py-2 rounded-md ${
                  extractedItems.length === 0
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-green-500 text-white hover:bg-green-600"
                }`}
              >
                Match Line Items
              </button>
              <button
                onClick={handleSaveChanges}
                disabled={Object.keys(matches).length === 0}
                className={`px-4 py-2 rounded-md ${
                  Object.keys(matches).length === 0
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-purple-500 text-white hover:bg-purple-600"
                }`}
              >
                Save Changes
              </button>
            </div>
  
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2>Extracted Items</h2>
                <table className="table-auto border-collapse border border-gray-300">
                  <thead>
                    <tr>
                      <th className="border border-gray-300 px-4 py-2">Request Item</th>
                      <th className="border border-gray-300 px-4 py-2">Amount</th>
                      <th className="border border-gray-300 px-4 py-2">Unit Price</th>
                      <th className="border border-gray-300 px-4 py-2">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {extractedItems.map((item, index) => (
                      <tr key={index}>
                        <td className="border border-gray-300 px-4 py-2">{item["Request Item"]}</td>
                        <td className="border border-gray-300 px-4 py-2">{item.Amount}</td>
                        <td className="border border-gray-300 px-4 py-2">{item["Unit Price"]}</td>
                        <td className="border border-gray-300 px-4 py-2">{item.Total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
  
              <div>
                <h2 className="text-lg font-semibold text-gray-700 mb-2">Matched Items</h2>
                {Object.entries(matches).map(([query, matchArray]) => (
                  <div key={query} className="mb-4">
                    <h3 className="font-bold">{query}</h3>
                    <select
                      value={editedMappings[query] || ""}
                      onChange={(event) => handleEditMapping(query, event.target.value)}
                      className="border p-2 rounded w-full"
                    >
                      {matchArray.map((match, index) => (
                        <option key={index} value={match.match}>
                          {match.match} (Confidence: {match.score.toFixed(2)}%)
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
  }

export default App;
