const DeviceSelector = ({ availableCameras, selectedCamera, setSelectedCamera, availableMicrophones, selectedMicrophone, setSelectedMicrophone }) => {
    return (
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-gray-600 font-medium">Select Camera:</label>
          <select
            onChange={(e) => setSelectedCamera(e.target.value)}
            value={selectedCamera}
            className="w-full p-2 border rounded-md"
          >
            {availableCameras.map((device) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || `Camera ${device.deviceId}`}
              </option>
            ))}
          </select>
        </div>
  
        <div>
          <label className="text-gray-600 font-medium">Select Microphone:</label>
          <select
            onChange={(e) => setSelectedMicrophone(e.target.value)}
            value={selectedMicrophone}
            className="w-full p-2 border rounded-md"
          >
            {availableMicrophones.map((device) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || `Microphone ${device.deviceId}`}
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  };
  
  export default DeviceSelector;
  