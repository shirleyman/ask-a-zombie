--
-- created with TexturePacker (http://www.codeandweb.com/texturepacker)
--
-- $TexturePacker:SmartUpdate:ee5be5a7af8afa79627d1deae020d7f6:adde72b27a05a4cf45dcd3e29a82095a:b7ace98e1231a2d4b4d79137dd7e346c$
--
-- local sheetInfo = require("mysheet")
-- local myImageSheet = graphics.newImageSheet( "mysheet.png", sheetInfo:getSheet() )
-- local sprite = display.newSprite( myImageSheet , {frames={sheetInfo:getFrameIndex("sprite")}} )
--

local SheetInfo = {}

SheetInfo.sheet =
{
    frames = {
    
        {
            -- speaker_off
            x=126,
            y=2,
            width=70,
            height=76,

            sourceX = 3,
            sourceY = 25,
            sourceWidth = 128,
            sourceHeight = 128
        },
        {
            -- speaker_on
            x=2,
            y=2,
            width=122,
            height=76,

            sourceX = 2,
            sourceY = 25,
            sourceWidth = 128,
            sourceHeight = 128
        },
    },
    
    sheetContentWidth = 198,
    sheetContentHeight = 80
}

SheetInfo.frameIndex =
{

    ["speaker_off"] = 1,
    ["speaker_on"] = 2,
}

function SheetInfo:getSheet()
    return self.sheet;
end

function SheetInfo:getFrameIndex(name)
    return self.frameIndex[name];
end

return SheetInfo
