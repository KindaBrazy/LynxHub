import fs from 'fs';

// Check if a file path was provided as a command-line argument.
if (process.argv.length < 3) {
  console.error('Usage: node modifyFile.js <path-to-file>');
  process.exit(1);
}

// Get the file path from the command-line arguments.
const filePath = process.argv[2];

try {
  // Read the content of the file synchronously.
  let content = fs.readFileSync(filePath, 'utf8');

  // Define the string to find and the string to replace it with.
  const findString = `const base = './';`;
  const replaceString = `const base = '/';`;

  // Use the replace method to update the content.
  const updatedContent = content.replace(findString, replaceString);

  // Write the updated content back to the file.
  fs.writeFileSync(filePath, updatedContent, 'utf8');

  console.log(`Successfully modified: ${filePath}`);
} catch (error) {
  // Handle any errors that occur during file operations.
  console.error(`An error occurred: ${error.message}`);
}
