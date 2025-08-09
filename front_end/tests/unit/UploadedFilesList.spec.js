import { mount } from "@vue/test-utils";
import UploadedFilesList from "@/components/UploadedFilesList.vue";

const files = [
  {
    name: "pic.png",
    type: "image/png",
    size: 1000,
    src: "/uploads/img/pic.png",
  },
  {
    name: "video.mp4",
    type: "video/mp4",
    size: 2000,
    src: "/uploads/video/video.mp4",
  },
];

describe("UploadedFilesList.vue", () => {
  it("renders rows for provided files", () => {
    const wrapper = mount(UploadedFilesList, { props: { files } });
    const rows = wrapper.findAll("tbody tr");
    expect(rows.length).toBe(files.length);
  });

  it("emits load-gallery when View is clicked", async () => {
    const wrapper = mount(UploadedFilesList, { props: { files } });
    const viewButtons = wrapper.findAll("button.btn.btn-success");
    expect(viewButtons.length).toBe(2);
    await viewButtons[0].trigger("click");
    expect(wrapper.emitted()["load-gallery"]).toBeTruthy();
    expect(wrapper.emitted()["load-gallery"][0][0]).toEqual(files[0]);
  });
});
