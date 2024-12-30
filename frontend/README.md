# Automated Document Processor - README

## Overview
The **Automated Document Processor** is a React-based web application designed to handle file uploads, extract line items from documents, match those items with potential mappings, and save the results to an AWS DynamoDB table.

## Features
- File upload and processing.
- Line item extraction from uploaded documents.
- Matching extracted items with potential mappings.
- Saving the processed data to AWS DynamoDB.
- User feedback with success indicators upon saving data.

## Requirements
- Node.js and npm installed.
- AWS account with DynamoDB configured.
- Access to APIs for line item extraction and matching.

## Setup and Installation
1. **Clone the Repository**:
   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure AWS**:
   Update the AWS configuration in the application:
   ```javascript
   AWS.config.update({
     region: "<your-region>",
     accessKeyId: "<your-access-key>",
     secretAccessKey: "<your-secret-key>",
   });
   ```

4. **Run the Application**:
   ```bash
   npm start
   ```

   The application will be available at `http://localhost:3000`.

## Application Flow
1. **File Upload**:
   - Users upload a document file.
   - The file name is stored for reference.

2. **Extract Line Items**:
   - Sends the uploaded file to an external API for extraction.
   - Displays the extracted line items in a table.

3. **Match Line Items**:
   - Sends the extracted line items to an external API for matching.
   - Displays the potential matches with confidence scores.
   - Allows users to edit mappings via a dropdown menu.

4. **Save Changes**:
   - Saves the mappings and file name as a single record in DynamoDB.
   - Displays a success indicator upon completion.

## File Structure
```
src/
├── components/
├── onsite_documents/
│   └── unique_fastener_catalog.csv
├── App.js
└── index.js
```

## AWS DynamoDB Integration
1. **DynamoDB Table Configuration**:
   - Table Name: `UserMappings`
   - Partition Key: `fileName`
   - Data Field: `data` (Stores mappings as a nested JSON object).

2. **Saving Data**:
   - The `handleSaveChanges` function uses the AWS SDK to save mappings:
     ```javascript
     const params = {
       TableName: "UserMappings",
       Item: {
         fileName: fileName,
         data: updatedMappings,
       },
     };
     ```

3. **Permissions**:
   Ensure the IAM user/role has the following permissions:
   - `dynamodb:PutItem`
   - `dynamodb:GetItem`

## Code Walkthrough

### Key Components
#### `handleFileUpload`
Handles file uploads and updates the `fileName` and `selectedFile` states.

#### `handleExtract`
Sends the uploaded file to an external API and updates the `extractedItems` state with the results.

#### `handleMatch`
Matches extracted items by querying an external API and populates `matches` and `editedMappings` states.

#### `handleSaveChanges`
Saves the final mappings to DynamoDB and sets `saveSuccess` to `true` upon success.

#### Conditional Rendering
- Displays success feedback using a checkmark and success message upon saving data.
- Shows buttons and data tables when `saveSuccess` is `false`.

### Inline Comments
- **AWS SDK Configuration**:
   ```javascript
   AWS.config.update({
     region: "us-east-1",
     accessKeyId: "<your-access-key>",
     secretAccessKey: "<your-secret-key>",
   });
   ```
   Configures the AWS SDK with the appropriate credentials and region.

- **Save Data**:
   ```javascript
   const params = {
     TableName: "UserMappings",
     Item: {
       fileName: fileName,
       data: updatedMappings,
     },
   };
   ```
   Saves the file name and mappings as a single record in DynamoDB.

- **Success Feedback**:
   ```javascript
   if (saveSuccess) {
     return (
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
     );
   }
   ```
   Displays a checkmark and success message upon successfully saving data.

## Testing
1. **File Upload**:
   - Upload a sample file and verify the file name is displayed.

2. **Extract Line Items**:
   - Test with valid and invalid files to ensure proper error handling.

3. **Match Line Items**:
   - Verify matches are fetched correctly and dropdown menus are populated.

4. **Save Changes**:
   - Verify data is saved to DynamoDB and success feedback is displayed.

## Future Enhancements
- Add user authentication for secure access.
- Implement pagination for large datasets.
- Integrate a logging mechanism for better debugging.
- Enhance UI/UX for better accessibility.



## Next Steps
- Change partitionKey logic
- Cloud Front for distribution
- Trie logic for searching catalogue
- Implement adding, deleting and searching in UI
- Create loop to originial screen after db insertion in UI