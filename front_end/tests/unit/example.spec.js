import { shallowMount } from "@vue/test-utils";
import FileUploader from "@/components/FileUploader.vue";

describe("FileUploader.vue", () => {
  it("renders the drop area", () => {
    const wrapper = shallowMount(FileUploader);
    expect(wrapper.text()).toContain("Drag and Drop");
  });
});
