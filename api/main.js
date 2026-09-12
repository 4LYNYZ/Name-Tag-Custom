module.exports = (req, res) => {
    const userAgent = req.headers['user-agent'] || '';

    // Deteksi apakah yang akses adalah browser biasa (Chrome, Edge, Firefox, Safari di HP/PC)
    const isBrowser = userAgent.includes("Mozilla/") && !userAgent.includes("Roblox");

    if (isBrowser) {
        // Kalau benar-benar dibrowser, lempar ke index.html
        res.writeHead(302, { Location: '/index.html' });
        res.end();
    } else {
        // Kalau dari executor Roblox atau curl/script, langsung kirim kodenya
        const luaScript = `
local UserInputService = game:GetService("UserInputService")
local Players = game:GetService("Players")
local TextChatService = game:GetService("TextChatService")

local player = Players.LocalPlayer
local playerGui = player:WaitForChild("PlayerGui")

-- State storage for colors and tag text
local tagText = "Fan"
local tagColor = Color3.fromRGB(120,120,120)
local chatColor = Color3.fromRGB(120,120,120)
local nameColor = Color3.fromRGB(120,120,120)
local activeColorTarget = nil

-- Create Main ScreenGui
local screenGui = Instance.new("ScreenGui")
screenGui.Name = "CustomChatTagUI"
screenGui.ResetOnSpawn = false
screenGui.Parent = playerGui

-- Main Frame Window
local mainFrame = Instance.new("Frame")
mainFrame.Name = "MainFrame"
mainFrame.Size = UDim2.new(0, 360, 0, 365)
mainFrame.Position = UDim2.new(0.5, -180, 0.5, -182)
mainFrame.BackgroundColor3 = Color3.fromRGB(35, 35, 38)
mainFrame.BorderSizePixel = 0
mainFrame.Parent = screenGui

local mainCorner = Instance.new("UICorner")
mainCorner.CornerRadius = UDim.new(0, 12)
mainCorner.Parent = mainFrame

-- Drag / Slide System
local dragging = false
local dragInput, dragStart, startPos

local function updateDrag(input)
	local delta = input.Position - dragStart
	mainFrame.Position = UDim2.new(
		startPos.X.Scale, 
		startPos.X.Offset + delta.X, 
		startPos.Y.Scale, 
		startPos.Y.Offset + delta.Y
	)
end

mainFrame.InputBegan:Connect(function(input)
	if input.UserInputType == Enum.UserInputType.MouseButton1 or input.UserInputType == Enum.UserInputType.Touch then
		dragging = true
		dragStart = input.Position
		startPos = mainFrame.Position

		input.Changed:Connect(function()
			if input.UserInputState == Enum.UserInputState.End then
				dragging = false
			end
		end)
	end
end)

mainFrame.InputChanged:Connect(function(input)
	if input.UserInputType == Enum.UserInputType.MouseMovement or input.UserInputType == Enum.UserInputType.Touch then
		dragInput = input
	end
end)

UserInputService.InputChanged:Connect(function(input)
	if input == dragInput and dragging then
		updateDrag(input)
	end
end)

-- Top Bar: Back & Close Buttons
local backButton = Instance.new("TextButton")
backButton.Name = "BackButton"
backButton.Size = UDim2.new(0, 90, 0, 32)
backButton.Position = UDim2.new(0, 12, 0, 12)
backButton.BackgroundColor3 = Color3.fromRGB(255, 255, 255)
backButton.Text = "V:Beta"
backButton.TextColor3 = Color3.fromRGB(0, 0, 0)
backButton.TextSize = 16
backButton.Font = Enum.Font.SourceSansBold
backButton.Parent = mainFrame

local backCorner = Instance.new("UICorner")
backCorner.CornerRadius = UDim.new(0, 6)
backCorner.Parent = backButton

local closeButton = Instance.new("TextButton")
closeButton.Name = "CloseButton"
closeButton.Size = UDim2.new(0, 32, 0, 32)
closeButton.Position = UDim2.new(1, -44, 0, 12)
closeButton.BackgroundColor3 = Color3.fromRGB(220, 30, 30)
closeButton.Text = "X"
closeButton.TextColor3 = Color3.fromRGB(255, 255, 255)
closeButton.TextSize = 18
closeButton.Font = Enum.Font.SourceSansBold
closeButton.Parent = mainFrame

local closeCorner = Instance.new("UICorner")
closeCorner.CornerRadius = UDim.new(0, 6)
closeCorner.Parent = closeButton

closeButton.MouseButton1Click:Connect(function()
	mainFrame.Visible = false
end)

-- Live Chat Preview Box
local previewFrame = Instance.new("Frame")
previewFrame.Name = "PreviewFrame"
previewFrame.Size = UDim2.new(1, -24, 0, 40)
previewFrame.Position = UDim2.new(0, 12, 0, 56)
previewFrame.BackgroundColor3 = Color3.fromRGB(25, 25, 28)
previewFrame.BorderColor3 = Color3.fromRGB(80, 80, 85)
previewFrame.BorderSizePixel = 1
previewFrame.Parent = mainFrame

local previewCorner = Instance.new("UICorner")
previewCorner.CornerRadius = UDim.new(0, 6)
previewCorner.Parent = previewFrame

local previewText = Instance.new("TextLabel")
previewText.Name = "PreviewText"
previewText.Size = UDim2.new(1, -16, 1, 0)
previewText.Position = UDim2.new(0, 8, 0, 0)
previewText.BackgroundTransparency = 1
previewText.RichText = true
previewText.TextXAlignment = Enum.TextXAlignment.Left
previewText.TextSize = 16
previewText.Font = Enum.Font.SourceSansBold
previewText.Parent = previewFrame

local function refreshPreview()
	local tagR, tagG, tagB = math.floor(tagColor.R * 255), math.floor(tagColor.G * 255), math.floor(tagColor.B * 255)
	local nameR, nameG, nameB = math.floor(nameColor.R * 255), math.floor(nameColor.G * 255), math.floor(nameColor.B * 255)
	local chatR, chatG, chatB = math.floor(chatColor.R * 255), math.floor(chatColor.G * 255), math.floor(chatColor.B * 255)
	
	local displayText = (tagText == "") and " " or tagText
	local formattedTag = string.format("[%s] ", displayText)
	
	previewText.Text = string.format(
		'<font color="rgb(%d,%d,%d)">%s</font><font color="rgb(%d,%d,%d)">%s:</font> <font color="rgb(%d,%d,%d)">Hello</font>',
		tagR, tagG, tagB, formattedTag,
		nameR, nameG, nameB, player.DisplayName,
		chatR, chatG, chatB
	)
end

-- COLOR PICKER POPUP WINDOW --
local pickerFrame = Instance.new("Frame")
pickerFrame.Name = "ColorPickerPopup"
pickerFrame.Size = UDim2.new(0, 300, 0, 260)
pickerFrame.Position = UDim2.new(0.5, -150, 0.5, -130)
pickerFrame.BackgroundColor3 = Color3.fromRGB(30, 30, 34)
pickerFrame.BorderSizePixel = 0
pickerFrame.Visible = false
pickerFrame.ZIndex = 5
pickerFrame.Parent = screenGui

local pickerCorner = Instance.new("UICorner")
pickerCorner.CornerRadius = UDim.new(0, 10)
pickerCorner.Parent = pickerFrame

-- Hex Code Display Label
local hexLabel = Instance.new("TextLabel")
hexLabel.Size = UDim2.new(1, 0, 0, 30)
hexLabel.Position = UDim2.new(0, 0, 0, 8)
hexLabel.BackgroundTransparency = 1
hexLabel.TextColor3 = Color3.fromRGB(255, 255, 255)
hexLabel.TextSize = 18
hexLabel.Font = Enum.Font.SourceSansBold
hexLabel.Text = "#FCD902"
hexLabel.ZIndex = 6
hexLabel.Parent = pickerFrame

-- Saturation/Value Canvas (Big Box)
local satValCanvas = Instance.new("ImageLabel")
satValCanvas.Size = UDim2.new(1, -24, 0, 120)
satValCanvas.Position = UDim2.new(0, 12, 0, 42)
satValCanvas.Image = "rbxassetid://4155801252"
satValCanvas.BackgroundColor3 = Color3.fromRGB(255, 0, 0)
satValCanvas.ZIndex = 6
satValCanvas.Parent = pickerFrame

local satValCorner = Instance.new("UICorner")
satValCorner.CornerRadius = UDim.new(0, 6)
satValCorner.Parent = satValCanvas

local cursor = Instance.new("Frame")
cursor.Size = UDim2.new(0, 10, 0, 10)
cursor.AnchorPoint = Vector2.new(0.5, 0.5)
cursor.Position = UDim2.new(1, 0, 0, 0)
cursor.BackgroundColor3 = Color3.fromRGB(255, 255, 255)
cursor.BorderSizePixel = 0
cursor.ZIndex = 7
cursor.Parent = satValCanvas

local cursorCorner = Instance.new("UICorner")
cursorCorner.CornerRadius = UDim.new(1, 0)
cursorCorner.Parent = cursor

-- Hue Bar (Built-in UIGradient Rainbow Slider)
local hueSlider = Instance.new("Frame")
hueSlider.Name = "HueSlider"
hueSlider.Size = UDim2.new(1, -24, 0, 20)
hueSlider.Position = UDim2.new(0, 12, 0, 170)
hueSlider.BackgroundColor3 = Color3.fromRGB(255, 255, 255)
hueSlider.BorderSizePixel = 0
hueSlider.ZIndex = 6
hueSlider.Parent = pickerFrame

local hueCorner = Instance.new("UICorner")
hueCorner.CornerRadius = UDim.new(0, 6)
hueCorner.Parent = hueSlider

local rainbowGradient = Instance.new("UIGradient")
rainbowGradient.Color = ColorSequence.new({
	ColorSequenceKeypoint.new(0, Color3.fromHSV(1, 1, 1)),
	ColorSequenceKeypoint.new(0.17, Color3.fromHSV(0.83, 1, 1)),
	ColorSequenceKeypoint.new(0.33, Color3.fromHSV(0.66, 1, 1)),
	ColorSequenceKeypoint.new(0.5, Color3.fromHSV(0.5, 1, 1)),
	ColorSequenceKeypoint.new(0.67, Color3.fromHSV(0.33, 1, 1)),
	ColorSequenceKeypoint.new(0.83, Color3.fromHSV(0.17, 1, 1)),
	ColorSequenceKeypoint.new(1, Color3.fromHSV(0, 1, 1))
})
rainbowGradient.Parent = hueSlider

-- Picker Action Buttons: Cancel / Ok
local cancelButton = Instance.new("TextButton")
cancelButton.Size = UDim2.new(0, 125, 0, 32)
cancelButton.Position = UDim2.new(0, 16, 0, 210)
cancelButton.BackgroundColor3 = Color3.fromRGB(45, 45, 50)
cancelButton.Text = "Cancel"
cancelButton.TextColor3 = Color3.fromRGB(255, 255, 255)
cancelButton.TextSize = 16
cancelButton.Font = Enum.Font.SourceSansBold
cancelButton.ZIndex = 6
cancelButton.Parent = pickerFrame

local cancelCorner = Instance.new("UICorner")
cancelCorner.CornerRadius = UDim.new(0, 6)
cancelCorner.Parent = cancelButton

local okButton = Instance.new("TextButton")
okButton.Size = UDim2.new(0, 125, 0, 32)
okButton.Position = UDim2.new(1, -141, 0, 210)
okButton.BackgroundColor3 = Color3.fromRGB(255, 255, 255)
okButton.Text = "Ok"
okButton.TextColor3 = Color3.fromRGB(0, 0, 0)
okButton.TextSize = 16
okButton.Font = Enum.Font.SourceSansBold
okButton.ZIndex = 6
okButton.Parent = pickerFrame

local okCorner = Instance.new("UICorner")
okCorner.CornerRadius = UDim.new(0, 6)
okCorner.Parent = okButton

-- HSV Calculation Logic
local h, s, v = 0, 1, 1
local selectedColor = Color3.fromHSV(h, s, v)

local function updateColorDisplay()
	selectedColor = Color3.fromHSV(h, s, v)
	satValCanvas.BackgroundColor3 = Color3.fromHSV(h, 1, 1)
	
	local r, g, b = math.floor(selectedColor.R * 255), math.floor(selectedColor.G * 255), math.floor(selectedColor.B * 255)
	hexLabel.Text = string.format("#%02X%02X%02X", r, g, b)
end

-- Drag logic for Saturation/Value canvas
local canvasDragging = false
satValCanvas.InputBegan:Connect(function(input)
	if input.UserInputType == Enum.UserInputType.MouseButton1 or input.UserInputType == Enum.UserInputType.Touch then
		canvasDragging = true
	end
end)

satValCanvas.InputEnded:Connect(function(input)
	if input.UserInputType == Enum.UserInputType.MouseButton1 or input.UserInputType == Enum.UserInputType.Touch then
		canvasDragging = false
	end
end)

UserInputService.InputChanged:Connect(function(input)
	if canvasDragging and (input.UserInputType == Enum.UserInputType.MouseMovement or input.UserInputType == Enum.UserInputType.Touch) then
		local absPos = satValCanvas.AbsolutePosition
		local absSize = satValCanvas.AbsoluteSize
		local mouseX = math.clamp(input.Position.X - absPos.X, 0, absSize.X)
		local mouseY = math.clamp(input.Position.Y - absPos.Y, 0, absSize.Y)
		
		s = mouseX / absSize.X
		v = 1 - (mouseY / absSize.Y)
		cursor.Position = UDim2.new(s, 0, 1 - v, 0)
		updateColorDisplay()
	end
end)

-- Drag logic for Hue Slider
local hueDragging = false
hueSlider.InputBegan:Connect(function(input)
	if input.UserInputType == Enum.UserInputType.MouseButton1 or input.UserInputType == Enum.UserInputType.Touch then
		hueDragging = true
	end
end)

hueSlider.InputEnded:Connect(function(input)
	if input.UserInputType == Enum.UserInputType.MouseButton1 or input.UserInputType == Enum.UserInputType.Touch then
		hueDragging = false
	end
end)

UserInputService.InputChanged:Connect(function(input)
	if hueDragging and (input.UserInputType == Enum.UserInputType.MouseMovement or input.UserInputType == Enum.UserInputType.Touch) then
		local absPos = hueSlider.AbsolutePosition
		local absSize = hueSlider.AbsoluteSize
		local mouseX = math.clamp(input.Position.X - absPos.X, 0, absSize.X)
		
		h = 1 - (mouseX / absSize.X)
		updateColorDisplay()
	end
end)

cancelButton.MouseButton1Click:Connect(function()
	pickerFrame.Visible = false
end)

okButton.MouseButton1Click:Connect(function()
	if activeColorTarget then
		if activeColorTarget.Name == "TagColorBtn" then
			tagColor = selectedColor
			activeColorTarget.BackgroundColor3 = tagColor
		elseif activeColorTarget.Name == "ChatColorBtn" then
			chatColor = selectedColor
			activeColorTarget.BackgroundColor3 = chatColor
		elseif activeColorTarget.Name == "NameColorBtn" then
			nameColor = selectedColor
			activeColorTarget.BackgroundColor3 = nameColor
		end
		refreshPreview()
	end
	pickerFrame.Visible = false
end)

-- Helper Function to Create Setting Rows
local function createSettingRow(posY, labelText, controlType, defaultVal, btnName)
	local label = Instance.new("TextLabel")
	label.Size = UDim2.new(0, 150, 0, 36)
	label.Position = UDim2.new(0, 16, 0, posY)
	label.BackgroundTransparency = 1
	label.Text = labelText
	label.TextColor3 = Color3.fromRGB(255, 255, 255)
	label.TextSize = 18
	label.Font = Enum.Font.SourceSans
	label.TextXAlignment = Enum.TextXAlignment.Left
	label.Parent = mainFrame

	if controlType == "TagInput" then
		local tagBox = Instance.new("TextBox")
		tagBox.Name = "TagInputBox"
		tagBox.Size = UDim2.new(0, 100, 0, 32)
		tagBox.Position = UDim2.new(1, -116, 0, posY + 2)
		tagBox.BackgroundColor3 = Color3.fromRGB(20, 20, 22)
		tagBox.Text = defaultVal
		tagBox.TextColor3 = Color3.fromRGB(255, 255, 255)
		tagBox.TextSize = 14
		tagBox.Font = Enum.Font.SourceSansBold
		tagBox.Parent = mainFrame

		local tagCorner = Instance.new("UICorner")
		tagCorner.CornerRadius = UDim.new(0, 6)
		tagCorner.Parent = tagBox

		tagBox:GetPropertyChangedSignal("Text"):Connect(function()
			tagText = tagBox.Text
			refreshPreview()
		end)

	elseif controlType == "ColorPicker" then
		local colorBtn = Instance.new("TextButton")
		colorBtn.Name = btnName
		colorBtn.Size = UDim2.new(0, 70, 0, 32)
		colorBtn.Position = UDim2.new(1, -86, 0, posY + 2)
		colorBtn.BackgroundColor3 = defaultVal
		colorBtn.Text = "🖌"
		colorBtn.TextColor3 = Color3.fromRGB(0, 0, 0)
		colorBtn.TextSize = 16
		colorBtn.Parent = mainFrame

		local colorCorner = Instance.new("UICorner")
		colorCorner.CornerRadius = UDim.new(0, 8)
		colorCorner.Parent = colorBtn

		colorBtn.MouseButton1Click:Connect(function()
			activeColorTarget = colorBtn
			pickerFrame.Visible = true
		end)
	end
end

-- Build Option Rows
createSettingRow(110, "Chat Tag", "TagInput", "ADMIN", "")
createSettingRow(160, "Tag Color", "ColorPicker", tagColor, "TagColorBtn")
createSettingRow(210, "Chat Color", "ColorPicker", chatColor, "ChatColorBtn")
createSettingRow(260, "Name Color", "ColorPicker", nameColor, "NameColorBtn")

-- Bottom Reset Button
local resetButton = Instance.new("TextButton")
resetButton.Name = "ResetButton"
resetButton.Size = UDim2.new(0, 100, 0, 32)
resetButton.Position = UDim2.new(0.5, -50, 0, 315)
resetButton.BackgroundColor3 = Color3.fromRGB(45, 45, 50)
resetButton.Text = "🔄 Reset"
resetButton.TextColor3 = Color3.fromRGB(255, 255, 255)
resetButton.TextSize = 15
resetButton.Font = Enum.Font.SourceSansBold
resetButton.Parent = mainFrame

local resetCorner = Instance.new("UICorner")
resetCorner.CornerRadius = UDim.new(0, 6)
resetCorner.Parent = resetButton

resetButton.MouseButton1Click:Connect(function` + `()
	tagText = "ADMIN"
	tagColor = Color3.fromRGB(240, 190, 20)
	chatColor = Color3.fromRGB(0, 0, 255)
	nameColor = Color3.fromRGB(240, 190, 20)
	
	local tagBox = mainFrame:FindFirstChild("TagInputBox")
	if tagBox then tagBox.Text = tagText end
	
	local tBtn = mainFrame:FindFirstChild("TagColorBtn")
	if tBtn then tBtn.BackgroundColor3 = tagColor end
	
	local cBtn = mainFrame:FindFirstChild("ChatColorBtn")
	if cBtn then cBtn.BackgroundColor3 = chatColor end
	
	local nBtn = mainFrame:FindFirstChild("NameColorBtn")
	if nBtn then nBtn.BackgroundColor3 = nameColor end
	
	refreshPreview()
end)

-- Helper to convert Color3 into rgb(r,g,b) for RichText
local function colorToRGBString(color)
	return string.format("rgb(%d,%d,%d)", math.floor(color.R * 255), math.floor(color.G * 255), math.floor(color.B * 255))
end

-- LIVE TEXTCHATSERVICE INTEGRATION --
TextChatService.OnIncomingMessage = function(message: TextChatMessage)
	local properties = Instance.new("TextChatMessageProperties")
	
	-- Apply colors to messages sent by the local player
	if message.TextSource and message.TextSource.UserId == player.UserId then
		local tagRgb = colorToRGBString(tagColor)
		local nameRgb = colorToRGBString(nameColor)
		local chatRgb = colorToRGBString(chatColor)
		
		local displayText = (tagText == "") and " " or tagText
		local formattedTag = string.format("[%s]", displayText)
		
		-- Formats: [TAG] DisplayName:
		properties.PrefixText = string.format(
			'<font color="%s">%s</font> <font color="%s">%s:</font>',
			tagRgb,
			formattedTag,
			nameRgb,
			player.DisplayName
		)
		
		-- Formats actual message text color
		properties.Text = string.format(
			'<font color="%s">%s</font>',
			chatRgb,
			message.Text
		)
	end
	
	return properties
end

-- Initialize Preview on load
refreshPreview()
        `;

        res.setHeader('Content-Type', 'text/plain');
        res.status(200).send(luaScript);
    }
};
