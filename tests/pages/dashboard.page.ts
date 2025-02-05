import { Page } from "@playwright/test"
import { fileItemId } from "../test-data/test.data"

export class Dashboard {
  constructor(private page: Page) {}

  //locators
  private uploadButton = this.page.locator("#upload_button")
  private modal = this.page.locator("#radix-\\:R9fntb\\:")
  private redirectingLoader = this.page.locator("#redirecting_loader")
  private fileItem = this.page.locator(fileItemId)
  private pdfField = this.page.locator("#pdf_field")
  private testFileDeleteBtn = this.page.locator("#test_file\\.pdf")

  //getters
  getUploadButton() {
    return this.uploadButton
  }

  getModal() {
    return this.modal
  }

  getRedirectingLoader() {
    return this.redirectingLoader
  }

  getFileItem() {
    return this.fileItem
  }

  getPdfField() {
    return this.pdfField
  }

  getTestFileDeleteBtn() {
    return this.testFileDeleteBtn
  }

  //actions
  async navigateToDashboard() {
    await this.page.goto("https://dokubot.vercel.app/dashboard/")
  }
}
