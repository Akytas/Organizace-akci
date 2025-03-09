document.addEventListener('DOMContentLoaded', () => {
    const addEventButton = document.getElementById('add-event-button');
    const eventFormModal = document.getElementById('event-form');
    const registerFormModal = document.getElementById('register-form');
    const closeButtons = document.querySelectorAll('.close-button');
    const newEventForm = document.getElementById('new-event-form');
    const registerEventForm = document.getElementById('register-event-form');
    const eventsContainer = document.getElementById('events-container');
    let currentEventNote = null;

    // Načtení uložených akcí z localStorage
    loadEvents();

    // Otevření formuláře pro vytvoření nové akce
    addEventButton.addEventListener('click', () => {
        newEventForm.reset(); // Vymazání formuláře při otevření
        eventFormModal.style.display = 'block';
    });

    // Zavření formulářů
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            eventFormModal.style.display = 'none';
            registerFormModal.style.display = 'none';
        });
    });

    // Zavření formulářů při kliknutí mimo ně
    window.addEventListener('click', (event) => {
        if (event.target == eventFormModal) {
            eventFormModal.style.display = 'none';
        }
        if (event.target == registerFormModal) {
            registerFormModal.style.display = 'none';
        }
    });

    // Vytvoření nové akce
    newEventForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const eventDate = document.getElementById('event-date').value;
        const eventName = document.getElementById('event-name').value;
        const driversCount = document.getElementById('drivers-count').value;
        const membersCount = document.getElementById('members-count').value;
        const equipment = Array.from(document.querySelectorAll('input[name="equipment"]:checked'))
            .map(checkbox => checkbox.value)
            .join(', ');

        const eventNote = document.createElement('div');
        eventNote.className = 'event-note';
        eventNote.dataset.date = eventDate;

        // Nastavení třídy podle typu akce
        if (document.getElementById('training').checked) {
            eventNote.classList.add('training');
        } else if (document.getElementById('social-event').checked) {
            eventNote.classList.add('social-event');
        }

        eventNote.innerHTML = `
            <p class="event-date">Dne ${formatDate(eventDate)} - ${eventName}</p>
            <p>Požadovaná technika: ${equipment}</p>
            <p>Počet požadovaných členů:</p>
            <table class="role-table">
                ${generateRoleRows(driversCount, membersCount)}
            </table>
            <button class="register-button">Přihlásit se</button>
            <button class="unregister-button">Odhlásit se</button>
            <button class="delete-button">Odstranit</button>
        `;

        eventsContainer.appendChild(eventNote);
        sortEvents();
        checkPastEvents();
        eventFormModal.style.display = 'none';

        // Uložení akce do localStorage
        saveEvent(eventDate, eventName, driversCount, membersCount, equipment, eventNote.classList);

        // Připojení událostí k tlačítkům
        attachEventHandlers(eventNote);
    });

    // Přihlášení na akci
    registerEventForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const role = document.getElementById('role-select').value;
        const name = document.getElementById('name-input').value;
        const roleElement = currentEventNote.querySelector(`.role-table td[data-role="${role}"]`);
        if (roleElement) {
            roleElement.textContent = name;
        }
        const roleOption = document.querySelector(`#role-select option[value="${role}"]`);
        if (roleOption) {
            roleOption.remove();
        }
        registerFormModal.style.display = 'none';
    });

    // Formátování data
    function formatDate(dateString) {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}.${month}.${year}`;
    }

    // Generování řádků pro role
    function generateRoleRows(driversCount, membersCount) {
        let rows = '';
        for (let i = 1; i <= driversCount; i++) {
            rows += `<tr><th><i class="fas fa-car role-icon"></i>řidič ${i}:</th><td data-role="řidič ${i}"></td></tr>`;
        }
        for (let i = 1; i <= membersCount; i++) {
            rows += `<tr><th><i class="fas fa-user role-icon"></i>člen ${i}:</th><td data-role="člen ${i}"></td></tr>`;
        }
        return rows;
    }

    // Seřazení akcí podle data
    function sortEvents() {
        const events = Array.from(eventsContainer.children);
        events.sort((a, b) => new Date(a.dataset.date) - new Date(b.dataset.date));
        events.forEach(event => eventsContainer.appendChild(event));
    }

    // Kontrola a přeškrtnutí proběhlých akcí
    function checkPastEvents() {
        const today = new Date();
        const events = document.querySelectorAll('.event-note');
        events.forEach(event => {
            const eventDate = new Date(event.dataset.date);
            if (eventDate < today) {
                event.classList.add('past-event');
            }
        });
    }

    // Uložení akce do localStorage
    function saveEvent(date, name, driversCount, membersCount, equipment, classes) {
        const events = JSON.parse(localStorage.getItem('events')) || [];
        events.push({ date, name, driversCount, membersCount, equipment, classes: Array.from(classes) });
        localStorage.setItem('events', JSON.stringify(events));
    }

    // Načtení akcí z localStorage
    function loadEvents() {
        const events = JSON.parse(localStorage.getItem('events')) || [];
        events.forEach(event => {
            const eventNote = document.createElement('div');
            eventNote.className = 'event-note';
            eventNote.dataset.date = event.date;
            eventNote.classList.add(...event.classes);

            eventNote.innerHTML = `
                <p class="event-date">Dne ${formatDate(event.date)} - ${event.name}</p>
                <p>Požadovaná technika: ${event.equipment}</p>
                <p>Počet požadovaných členů:</p>
                <table class="role-table">
                    ${generateRoleRows(event.driversCount, event.membersCount)}
                </table>
                <button class="register-button">Přihlásit se</button>
                <button class="unregister-button">Odhlásit se</button>
                <button class="delete-button">Odstranit</button>
            `;

            eventsContainer.appendChild(eventNote);
            attachEventHandlers(eventNote);
        });
        sortEvents();
        checkPastEvents();
    }

    // Odstranění akce z localStorage
    function removeEvent(date) {
        let events = JSON.parse(localStorage.getItem('events')) || [];
        events = events.filter(event => event.date !== date);
        localStorage.setItem('events', JSON.stringify(events));
    }

    // Připojení událostí k tlačítkům
    function attachEventHandlers(eventNote) {
        // Otevření formuláře pro přihlášení na akci
        const registerButton = eventNote.querySelector('.register-button');
        registerButton.addEventListener('click', () => {
            currentEventNote = eventNote;
            const roleSelect = document.getElementById('role-select');
            roleSelect.innerHTML = '';

            const roles = eventNote.querySelectorAll('.role-table td');
            roles.forEach(role => {
                if (!role.textContent) {
                    const option = document.createElement('option');
                    option.value = role.dataset.role;
                    option.textContent = role.dataset.role;
                    roleSelect.appendChild(option);
                }
            });

            registerFormModal.style.display = 'block';
        });

        // Otevření formuláře pro odhlášení z akce
        const unregisterButton = eventNote.querySelector('.unregister-button');
        unregisterButton.addEventListener('click', () => {
            currentEventNote = eventNote;
            const unregisterRoleSelect = document.createElement('select');
            unregisterRoleSelect.id = 'unregister-role-select';
            unregisterRoleSelect.required = true;

            const roles = eventNote.querySelectorAll('.role-table td');
            roles.forEach(role => {
                if (role.textContent) {
                    const option = document.createElement('option');
                    option.value = role.dataset.role;
                    option.textContent = role.dataset.role;
                    unregisterRoleSelect.appendChild(option);
                }
            });

            const unregisterConfirmation = document.createElement('p');
            unregisterConfirmation.id = 'unregister-confirmation';

            const unregisterForm = document.createElement('form');
            unregisterForm.id = 'unregister-event-form';
            unregisterForm.innerHTML = `
                <label for="unregister-role-select">Odhlásit se jako:</label>
            `;
            unregisterForm.appendChild(unregisterRoleSelect);
            unregisterForm.appendChild(unregisterConfirmation);
            const confirmButton = document.createElement('button');
            confirmButton.type = 'submit';
            confirmButton.textContent = 'Potvrdit odhlášení';
            unregisterForm.appendChild(confirmButton);

            eventNote.appendChild(unregisterForm);

            unregisterForm.addEventListener('submit', (event) => {
                event.preventDefault();
                const role = unregisterRoleSelect.value;
                const roleElement = currentEventNote.querySelector(`.role-table td[data-role="${role}"]`);
                if (roleElement && roleElement.textContent) {
                    const name = roleElement.textContent;
                    const confirmation = confirm(`Opravdu chcete odhlásit ${name} z role ${role}?`);
                    if (confirmation) {
                        roleElement.textContent = '';
                        const roleSelect = document.getElementById('role-select');
                        const option = document.createElement('option');
                        option.value = role;
                        option.textContent = role;
                        roleSelect.appendChild(option);
                    }
                }
                unregisterForm.remove();
            });
        });

        // Odstranění proběhlé akce
        const deleteButton = eventNote.querySelector('.delete-button');
        deleteButton.addEventListener('click', () => {
            const confirmation1 = confirm('Opravdu chcete odstranit tuto akci?');
            if (confirmation1) {
                const confirmation2 = confirm('Opravdu jste si jisti, že chcete odstranit tuto akci?');
                if (confirmation2) {
                    eventNote.remove();
                    // Odstranění akce z localStorage
                    removeEvent(eventNote.dataset.date);
                }
            }
        });
    }

    // Kontrola proběhlých akcí při načtení stránky
    checkPastEvents();
});