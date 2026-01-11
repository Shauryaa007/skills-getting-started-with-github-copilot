document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      console.log("Fetch /activities status:", response.status);
      const text = await response.text();
      console.log("Fetch /activities raw body:", text);

      let activities;
      try {
        activities = JSON.parse(text);
      } catch (jsonError) {
        activitiesList.innerHTML = '<p style="color: #b91c1c; font-weight: bold;">Activities data is not valid JSON.</p>';
        console.error("JSON parse error:", jsonError);
        return;
      }

      if (!response.ok) {
        activitiesList.innerHTML = `<p style="color: #b91c1c; font-weight: bold;">Failed to load activities (status ${response.status}).</p>`;
        return;
      }

      if (!activities || Object.keys(activities).length === 0) {
        activitiesList.innerHTML = '<p style="color: #b91c1c; font-weight: bold;">No activities found.</p>';
        return;
      }

      // Clear loading message
      activitiesList.innerHTML = "";
      // Clear dropdown options except the first placeholder
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        // Only process objects that have a description property (i.e., real activities)
        if (!details || typeof details !== "object" || !details.description) return;

        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
        `;

        // Participants Section
        const participantsSection = document.createElement("div");
        participantsSection.className = "participants-section";

        const participantsHeader = document.createElement("h4");
        participantsHeader.textContent = "Participants";
        participantsSection.appendChild(participantsHeader);

        const participantsList = document.createElement("ul");
        participantsList.className = "participants-list";

        if (details.participants && details.participants.length > 0) {
          details.participants.forEach((email) => {
            const li = document.createElement("li");
            li.textContent = email;
            participantsList.appendChild(li);
          });
        } else {
          const li = document.createElement("li");
              participantsList.className = "participants-list";
              participantsList.style.listStyleType = "none";
              participantsList.style.paddingLeft = "0";
          participantsList.appendChild(li);
        }

        participantsSection.appendChild(participantsList);
                  li.style.display = "flex";
                  li.style.alignItems = "center";

                  // Email text
                  const emailSpan = document.createElement("span");
                  emailSpan.textContent = email;
                  emailSpan.style.flex = "1";
                  li.appendChild(emailSpan);

                  // Delete icon
                  const deleteBtn = document.createElement("button");
                  deleteBtn.innerHTML = "&#128465;"; // Trash can emoji
                  deleteBtn.title = "Unregister participant";
                  deleteBtn.className = "delete-participant-btn";
                  deleteBtn.style.marginLeft = "8px";
                  deleteBtn.style.background = "none";
                  deleteBtn.style.border = "none";
                  deleteBtn.style.cursor = "pointer";
                  deleteBtn.style.color = "#b91c1c";

                  deleteBtn.addEventListener("click", async () => {
                    // Disable button while processing
                    deleteBtn.disabled = true;
                    deleteBtn.innerHTML = "...";
                    try {
                      const response = await fetch(`/activities/${encodeURIComponent(name)}/unregister?email=${encodeURIComponent(email)}`, {
                        method: "POST",
                      });
                      const result = await response.json();
                      if (response.ok) {
                        // Remove participant from UI
                        li.remove();
                        messageDiv.textContent = result.message || "Participant unregistered.";
                        messageDiv.className = "success";
                      } else {
                        messageDiv.textContent = result.detail || "Failed to unregister participant.";
                        messageDiv.className = "error";
                      }
                      messageDiv.classList.remove("hidden");
                      setTimeout(() => {
                        messageDiv.classList.add("hidden");
                      }, 5000);
                    } catch (error) {
                      messageDiv.textContent = "Error unregistering participant.";
                      messageDiv.className = "error";
                      messageDiv.classList.remove("hidden");
                      console.error("Error unregistering participant:", error);
                    } finally {
                      deleteBtn.disabled = false;
                      deleteBtn.innerHTML = "&#128465;";
                    }
                  });

                  li.appendChild(deleteBtn);
                  participantsList.appendChild(li);

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = '<p style="color: #b91c1c; font-weight: bold;">Failed to load activities. Please try again later.</p>';
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        // Refresh activities list to show new participant
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
