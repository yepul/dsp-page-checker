const ExcelJS = require("exceljs");
const fs = require("fs");
const puppeteer = require("puppeteer");
const path = require("path");
const moment = require("moment");

const timestamp = moment().format("YYYYMMDD_HHmm");

// Function to display a simple text-based loader with the current URL and page number
function showLoader(currentUrl, pageNumber) {
  const spinner = ["|", "/", "-", "\\"];
  let i = 0;
  return setInterval(() => {
    process.stdout.write(
      `\rLoading ${spinner[i]} ${currentUrl} | page: ${pageNumber}`
    );
    i = (i + 1) % spinner.length;
  }, 200);
}

// Function to clear the contents of the image folder
function clearImageFolder() {
  const imageFolder = path.join(__dirname, "image");

  if (fs.existsSync(imageFolder)) {
    fs.readdirSync(imageFolder).forEach((file) => {
      const filePath = path.join(imageFolder, file);
      fs.unlinkSync(filePath);
    });
  } else {
    fs.mkdirSync(imageFolder);
  }
}

// Function to capture a screenshot of a URL and get the status code
async function captureScreenshot(browser, url, row, retries = 1) {
  try {
    const page = await browser.newPage();
    const response = await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: 5000,
    });
    const status = response.status();
    const screenshotPath = path.join(
      __dirname,
      "image",
      `${timestamp}_screenshot_${row}.png`
    );
    await page.screenshot({ path: screenshotPath });
    await page.close();
    return { screenshotPath, status };
  } catch (error) {
    console.error(`Failed to capture screenshot for ${url}:`, error.message);
    if (retries > 0) {
      console.log(`Retrying ${url}... (${retries} attempts left)`);
      return captureScreenshot(browser, url, row, retries - 1);
    }
    return { screenshotPath: null, status: error.message };
  }
}

async function captureAndSaveScreenshots(urls) {
  // Create a new Excel workbook
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("DSP");

  // Set the titles in row 1
  worksheet.getCell("A1").value = "#";
  worksheet.getCell("B1").value = "URL";
  worksheet.getCell("C1").value = "Image";
  worksheet.getCell("D1").value = "Status";

  // Initialize the current row
  let currentRow = 2;

  const needToWait = [
    // Add URLs that need additional wait time here
  ];

  const browser = await puppeteer.launch({ headless: new });

  // Iterate over the list of URLs
  for (const imageUrl of urls) {
    // Show loader with current URL and page number
    const loadingInterval = showLoader(imageUrl, currentRow - 1);

    let { screenshotPath, status } = await captureScreenshot(
      browser,
      imageUrl,
      currentRow - 1,
      2
    );
    worksheet.getRow(currentRow).height = 120;

    // Add the screenshot image to the worksheet if it exists
    if (screenshotPath) {
      const image = workbook.addImage({
        filename: screenshotPath,
        extension: "png",
      });
      worksheet.addImage(image, {
        tl: { col: 2, row: currentRow - 1 }, // Adjust the row to be one less
        ext: { width: 250, height: 200 },
      });
      worksheet.getCell(`D${currentRow}`).value = status;
    } else {
      worksheet.getCell(`D${currentRow}`).value = status;
    }

    // Set the current row number in cell A2, A3, ...
    worksheet.getCell(`A${currentRow}`).value = currentRow - 1;

    // Set the image URL in cell B2, B3, ...
    worksheet.getCell(`B${currentRow}`).value = imageUrl;

    // Increment the current row
    currentRow++;

    // Set column widths to ensure data fits
    worksheet.getColumn("A").width = 10;
    worksheet.getColumn("B").width = 80;
    worksheet.getColumn("C").width = 35;
    worksheet.getColumn("D").width = 60;

    // Clear the loader and stop the interval
    clearInterval(loadingInterval);
    process.stdout.write("\r"); // Clear the loading line
  }

  await browser.close();

  // Save the Excel file
  await workbook.xlsx.writeFile("excel/" + timestamp + ".xlsx");
  console.log("Excel file with screenshots and data saved.");

  // Clear the contents of the image folder
  clearImageFolder();
}

const urlsToCapture = [
  "https://www.etiqa.com.my/v2/homepage",
  "https://www.motortakaful.com/motorcar/en/takaful/getquote1",
  "https://www.etiqa.com.my/motorcar/en/insurance/getquote1",
  "https://www.motortakaful.com/motorcycle/en/takaful/getquote1",
  "https://www.etiqa.com.my/motorcycle/en/insurance/getquote1",
  "https://www.etiqa.com.my/tripcare360-new/en/insurance/qq1",
  "https://www.etiqa.com.my/tripcare360-new/en/takaful/qq1",
  "https://www.etiqa.com.my/getonline/TravelEzyInsurance",
  "https://www.etiqa.com.my/getonline/TravelEzyTakaful",
  "https://etiqa.com.my/myrumah/insurance/en/qq1",
  "https://etiqa.com.my/myrumah/takaful/en/qq1",
  "https://www.etiqa.com.my/hohh/insurance/en/qq1",
  "https://www.etiqa.com.my/hohh/takaful/en/qq1",
  "https://www.etiqa.com.my/oto360/en/takaful/getquote",
  "https://www.etiqa.com.my/oto360/en/insurance/getquote",
  "https://www.etiqa.com.my/getonline/BuddyInsurance",
  "https://www.etiqa.com.my/getonline/BuddyTakaful",
  "https://www.etiqa.com.my/icare-oku/en/takaful/tkf-en-qq1",
  "https://www.etiqa.com.my/icare-oku/en/takaful/tkf-en-qq1",
  "https://www.etiqa.com.my/termlife/isecure/en/qq1",
  "https://etiqa.com.my/termlife/ezylifesecure/en/qq1",
  "https://www.etiqa.com.my/termlife/ezysecure/en/qq1",
  "https://www.etiqa.com.my/termlife/idoublesecure/en/qq1",
  "https://www.etiqa.com.my/medical-family/en/insurance/ins-en-qq1",
  "https://www.etiqa.com.my/medical-family/en/takaful/tkf-en-qq1",
  "https://www.etiqa.com.my/cancer-care/en/insurance/qq1",
  "https://www.etiqa.com.my/cancer-care/en/takaful",
  "https://www.motortakaful.com/home",
];

captureAndSaveScreenshots(urlsToCapture).catch((error) => {
  console.error("Error:", error);
});
