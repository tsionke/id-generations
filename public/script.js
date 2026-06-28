function generateID() {
  const name = document.getElementById("name").value.trim();
  const department = document.getElementById("department").value.trim();
  const date = document.getElementById("date").value.trim();
  const photoInput = document.getElementById("photo");

  // Update preview
  document.getElementById("preview-name").textContent = `Name: ${name}`;
  document.getElementById("preview-dept").textContent = `Department: ${department}`;
  document.getElementById("preview-date").textContent = `Date: ${date}`;

  if (photoInput.files.length === 0) {
    saveEmployeeAndQR("assets/default-photo.png");
  } else {
    const reader = new FileReader();
    reader.onload = e => {
      const photoBase64 = e.target.result;
      document.getElementById("photo-preview").src = photoBase64;
      saveEmployeeAndQR(photoBase64);
    };
    reader.readAsDataURL(photoInput.files[0]);
  }

  
  function saveEmployeeAndQR(photoBase64) {
    const employee = { name, department, date, photo: photoBase64 };

    fetch("/api/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(employee),
    })
      .then(res => res.json())
      .then(data => {
        const paddedID = String(data.id).padStart(4, "0");
        document.getElementById("preview-id").textContent = `ID: ${paddedID}`;
        generateQRCode(paddedID);
      })
      .catch(err => {
        console.error("Error saving employee:", err);
        document.getElementById("preview-id").textContent = "ID: ----";
        generateQRCode("----");
      });
  }

  function generateQRCode(id) {
    const qrData = `ID: ${id}\nName: ${name}\nDepartment: ${department}\nDate: ${date}`;
    const qrContainer = document.getElementById("qrcode");
    qrContainer.innerHTML = "";
    new QRCode(qrContainer, {
      text: qrData,
      width: 100,
      height: 100,
    });
  }
}

async function downloadPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: "portrait", unit: "px", format: [300, 400] });

  const front = document.querySelector(".id-side.front");
  const back = document.querySelector(".id-side.back");

  // Wait for QR code fully render
  await new Promise(resolve => setTimeout(resolve, 500));

  const frontCanvas = await html2canvas(front);
  const imgFront = frontCanvas.toDataURL("image/png");
  doc.addImage(imgFront, "PNG", 25, 25, 250, 350);

  doc.addPage();

  const backCanvas = await html2canvas(back);
  const imgBack = backCanvas.toDataURL("image/png");
  doc.addImage(imgBack, "PNG", 25, 25, 250, 350);

  doc.save("employee-id.pdf");
}
