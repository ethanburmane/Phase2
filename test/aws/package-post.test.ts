import {isValidRequest, createPackageID} from "../../src/AWS/Lambda/package/post"

describe('Tests for ingestion / upload helper functions', () => {
    it("Validation request should fail when content and url are both present", () => {
        const test = {"Content": "x", "URL": "y"}
        const res = isValidRequest(test)
        expect(res).toBe(false)
    })
    it("Validation request should fail when content and url are not present", () => {
      const test = {"example": ""}
      const res = isValidRequest(test)
      expect(res).toBe(false)
    })
    it("Validation request should pass when content or url is present", () => {
      const test_cont = {"Content": "x"}
      const test_url = {"URL": "y"}
      const res_cont = isValidRequest(test_cont)
      const res_url = isValidRequest(test_url)
      expect(res_cont).toBe(true)
      expect(res_url).toBe(true)
  })
  it("Create id should concatenate name and id", () =>
  {
    const name = "phase2"
    const version = "1.0.0"
    const res = createPackageID(name, version)
    expect(res).toBe(name + version)
  })
})