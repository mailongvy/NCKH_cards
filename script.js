const advisorContainer = document.getElementById("advisorContainer");
const memberContainer = document.getElementById("memberContainer");
const cardTemplate = document.getElementById("cardTemplate");

const fallbackImage =
  "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=900&q=80";

const embeddedMemberText = `Nguyễn Tuấn Dũng (Trưởng nhóm)
26/8/2004
0941569117
nguyentuandung2608@gmail.com

Trần Nguyễn Bảo Phúc
1/1/2004
0775418774
vinhdaicadn10@gmail.com

Mai Long Vỹ
7/8/2004
0903433552
mlongvy0708@gmail.com

Nguyễn Thị Tường Vy
14/3/2004
0935288046
alicenguyenvy14@gmail.com

Trần Văn Líc (Giảng Viên hướng dẫn)
070 6145 815
tvlic@dut.udn.vn`;

function normalizeVietnamese(text) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/\([^)]*\)/g, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function parseMembers(content) {
  const blocks = content
    .trim()
    .split(/\r?\n\s*\r?\n/)
    .map((block) => block.split(/\r?\n/).map((line) => line.trim()).filter(Boolean));

  return blocks.map((lines) => {
    const fullName = lines[0] || "";
    const isAdvisor =
      fullName.toLowerCase().includes("giáo viên hướng dẫn") ||
      fullName.toLowerCase().includes("giảng viên hướng dẫn") ||
      fullName.toLowerCase().includes("giao vien huong dan") ||
      fullName.toLowerCase().includes("giang vien huong dan");
    const pureName = fullName.replace(/\([^)]*\)/g, "").trim();
    const roleInName = (fullName.match(/\(([^)]*)\)/) || [])[1] || "";
    const normalizedFullName = normalizeVietnamese(fullName).replace(/_/g, " ");

    let dob = "Không có";
    let phone = "Không có";
    let email = "Không có";

    if (lines.length >= 4) {
      dob = lines[1] || dob;
      phone = lines[2] || phone;
      email = lines[3] || email;
    } else {
      phone = lines[1] || phone;
      email = lines[2] || email;
    }

    return {
      fullName,
      pureName,
      role: roleInName || (isAdvisor ? "Giảng viên hướng dẫn" : "Thành viên"),
      isAdvisor,
      dob,
      phone,
      email,
      image: `./${normalizeVietnamese(pureName)}.jpg`
    };
  });
}

function createCard(member) {
  const card = cardTemplate.content.firstElementChild.cloneNode(true);
  const img = card.querySelector(".avatar");

  card.querySelector(".name").textContent = member.pureName;
  card.querySelector(".role").textContent = member.role;
  card.querySelector(".dob").textContent = member.dob;
  card.querySelector(".phone").textContent = member.phone;
  card.querySelector(".email").textContent = member.email;

  img.src = member.image;
  img.alt = member.pureName;
  img.onerror = () => {
    img.src = fallbackImage;
  };

  card.addEventListener("mouseenter", () => {
    document.body.classList.add("cards-focused");
    document.querySelectorAll(".member-card").forEach((c) => c.classList.remove("active"));
    card.classList.add("active");
  });

  card.addEventListener("mouseleave", () => {
    card.classList.remove("active");
    document.body.classList.remove("cards-focused");
  });

  card.addEventListener("focus", () => {
    document.body.classList.add("cards-focused");
    document.querySelectorAll(".member-card").forEach((c) => c.classList.remove("active"));
    card.classList.add("active");
  });

  card.addEventListener("blur", () => {
    card.classList.remove("active");
    document.body.classList.remove("cards-focused");
  });

  return card;
}

async function init() {
  let text = embeddedMemberText;

  try {
    const response = await fetch("./Member.txt");
    if (response.ok) {
      text = await response.text();
    }
  } catch (_error) {
    text = embeddedMemberText;
  }

  const members = parseMembers(text);

  const advisor = members.find((m) => m.isAdvisor);
  const teamMembers = members.filter((m) => !m.isAdvisor);

  if (advisor) {
    advisorContainer.appendChild(createCard(advisor));
  }

  teamMembers.forEach((member) => memberContainer.appendChild(createCard(member)));
}

init();
