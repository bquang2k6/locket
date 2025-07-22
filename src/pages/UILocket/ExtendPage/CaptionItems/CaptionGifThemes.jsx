import React from "react";

export default function CaptionGifThemes({ title, captionThemes, onSelect, extraButton }) {
  // Preset GIF mẫu để test nếu captionThemes.image_gif rỗng
  const sampleGifPresets = [
    // {
    //   id: "93eca021-db2d-47d6-9921-e266dc2dd7dc",
    //   preset_id: "happy_blue_sky",
    //   type: "image_gif",
    //   icon: "https://firebasestorage.googleapis.com/v0/b/webdio-20ca8.appspot.com/o/locket-dio-gif%2FHappy-Blue-Sky.gif?alt=media&token=c203236c-5442-4212-9b8b-f0ff15ac996e",
    //   preset_caption: "Caption",
    //   color_top: "#E3F2FD",
    //   color_bottom: "#BBDEFB",
    //   text_color: "#ffffff",
    // },
    // {
    //   id: "2a39dc65-1cdd-4a70-8aa4-0c06acdfbec6",
    //   preset_id: "dog_what",
    //   type: "image_gif",
    //   icon: "https://firebasestorage.googleapis.com/v0/b/webdio-20ca8.appspot.com/o/locket-dio-gif%2FDog-What.gif?alt=media&token=6b48e292-8d2d-45a2-9a44-8926c102837f",
    //   preset_caption: "Caption",
    //   color_top: "#FFF8E1",
    //   color_bottom: "#FFECB3",
    //   text_color: "#F57F17",
    // },
    // {
    //   id: "e0068341-87aa-49a4-80a1-ce1697bce478",
    //   preset_id: "death",
    //   type: "image_gif",
    //   icon: "https://firebasestorage.googleapis.com/v0/b/webdio-20ca8.appspot.com/o/locket-dio-gif%2Fdeath.gif?alt=media&token=befd70fc-5d90-4575-8bd2-f88fd821ab1f",
    //   preset_caption: "Death",
    //   color_top: "#FCE4EC",
    //   color_bottom: "#F8BBD9",
    //   text_color: "#C2185B",
    // },
    // {
    //   id: "49035e78-eaac-48e4-a237-6619c3d43692",
    //   preset_id: "uia_uia_cat",
    //   type: "image_gif",
    //   icon: "https://firebasestorage.googleapis.com/v0/b/webdio-20ca8.appspot.com/o/locket-dio-gif%2Foia-uia.gif?alt=media&token=90bb9b04-e7de-47db-ab88-4c293e1299db",
    //   preset_caption: "Caption",
    //   color_top: "#F3E5F5",
    //   color_bottom: "#E1BEE7",
    //   text_color: "#7B1FA2",
    // },
    // {
    //   id: "45d5ff97-e3bb-46bb-ad2e-6311b09d3aa9",
    //   preset_id: "aaaah_cat",
    //   type: "image_gif",
    //   icon: "https://firebasestorage.googleapis.com/v0/b/webdio-20ca8.appspot.com/o/locket-dio-gif%2Faaaah-cat.gif?alt=media&token=caecbe88-21b8-4c9e-b94f-7f0b3e1b6023",
    //   preset_caption: "Caption",
    //   color_top: "#E0F2F1",
    //   color_bottom: "#B2DFDB",
    //   text_color: "#00695C",
    // },
    // {
    //   id: "c48adbbe-51f7-4af6-ba3b-6a278c7dd290",
    //   preset_id: "fat-horse",
    //   type: "image_gif",
    //   icon: "https://firebasestorage.googleapis.com/v0/b/webdio-20ca8.appspot.com/o/locket-dio-gif%2Ffat-horse.gif?alt=media&token=8af07462-8faa-4aa9-8e32-a468baf82c0b",
    //   preset_caption: "Caption",
    //   color_top: "#FFF3E0",
    //   color_bottom: "#FFE0B2",
    //   text_color: "#E65100",
    // },
    // {
    //   id: "53139545-0621-4202-87ae-cbcfa4b0be68",
    //   preset_id: "banana_crying_cat",
    //   type: "image_gif",
    //   icon: "https://firebasestorage.googleapis.com/v0/b/webdio-20ca8.appspot.com/o/locket-dio-gif%2Fbanana-crying-cat.gif?alt=media&token=6573e09a-30b7-4cdb-a29c-41274557ff33",
    //   preset_caption: "Caption",
    //   color_top: "#F9FBE7",
    //   color_bottom: "#F0F4C3",
    //   text_color: "#827717",
    // },
  ];
  const gifPresets = captionThemes?.image_gif?.length
    ? captionThemes.image_gif
    : sampleGifPresets;

  return (
    <div>
      {title && (
        <>
          <div className="flex flex-row gap-3 items-center mb-2">
            <h2 className="text-md font-semibold text-primary">{title}</h2>
            <div className="badge badge-sm badge-secondary">New</div>
          </div>
        </>
      )}
      <div className="flex flex-wrap gap-4 pt-2 pb-5 justify-start">
        {gifPresets.map((preset) => (
          <button
            key={preset.id}
            onClick={() => onSelect(preset)}
            className="flex flex-col whitespace-nowrap items-center space-y-1 py-2 px-4 btn h-auto w-auto rounded-3xl font-semibold justify-center"
            style={{
              background: '#181A20',
              color: '#fff',
            }}
          >
            <span className="text-base flex flex-row items-center">
              <img src={preset.icon} alt="" className="w-5 h-5 mr-2" />
              {preset.preset_caption || "Caption"}
            </span>
          </button>
        ))}
        {extraButton}
      </div>
    </div>
  );
} 