class Occupation {
    constructor(id, name) {
        this.id = id;
        this.name = name;
    }
    update(newData) {
        if (newData.name) this.name = newData.name;
    }
}

class OccupationContainer {
    constructor() {
        this.occupations = [];
    }

    addOccupation(occupation) {
        if (!(occupation instanceof Occupation)) {
            throw new Error("Invalid occupation object. Must be an instance of Occupation.");
        }
        this.occupations.push(occupation);
    }

    getOccupationById(id) {
        return this.occupations.find(occupation => occupation.id === id);
    }

    getAllOccupations() {
        return this.occupations;
    }

    removeOccupationById(id) {
        const initialLength = this.occupations.length;
        this.occupations = this.occupations.filter(occupation => occupation.id !== id);
        return this.occupations.length < initialLength;
    }
     updateOccupation(id, newData) {
        const occupation = this.getOccupationById(id);
        if (occupation) {
            occupation.update(newData);
            return true;
        }
        return false;
    }
}

// --- EventOccupation Class and Container ---
class EventOccupation {
    constructor(eventId, eventName, occupationId, occupationName, mentorCount, hoursCount) { // Added hoursCount
        this.eventId = eventId;
        this.eventName = eventName;
        this.occupationId = occupationId;
        this.occupationName = occupationName;
        this.mentorCount = mentorCount;
        this.hoursCount = hoursCount; // Added hoursCount
    }
}

class EventOccupationContainer {
    constructor() {
        this.eventOccupations = [];
    }

    addEventOccupation(eventOccupation) {
        if (!(eventOccupation instanceof EventOccupation)) {
            throw new Error("Invalid eventOccupation object. Must be an instance of EventOccupation.");
        }
        this.eventOccupations.push(eventOccupation);
    }

    getAllEventOccupations() {
        return this.eventOccupations;
    }

    removeEventOccupation(eventId, occupationId) {
        const initialLength = this.eventOccupations.length;
        this.eventOccupations = this.eventOccupations.filter(eo => !(eo.eventId === eventId && eo.occupationId === occupationId));
        return this.eventOccupations.length < initialLength;
    }
}
// --- Global Instances ---
const occupationContainer = new OccupationContainer();
const eventOccupationContainer = new EventOccupationContainer();

$(document).ready(function() {

    // --- Event Handlers (using event delegation) ---
    $('#occupationsTable tbody').on('click', '.edit-button', handleEditOccupationClick);
    $('#occupationsTable tbody').on('click', '.cancel-button', handleCancelOccupationClick);
    $('#occupationsTable tbody').on('click', '.delete-button', handleDeleteOccupationClick);
    $('#eventOccupationsTable tbody').on('click', '.delete-event-occupation-button', handleDeleteEventOccupationClick);

    $('#addOccupationToEventBtn').click(handleAddOccupationToEvent);
    $('#newOccupationEventBtn').click(showAddOccupationEventForm);
    $('#cancelAddOccupationToEventBtn').click(hideAddOccupationEventForm);


    // --- Load Initial Data ---
    loadOccupations();
    loadEventsIntoSelect();
    loadOccupationsIntoSelect(); //Load selects
    loadEventOccupations();


    // --- Function Definitions ---
    //--Occupation handlers--
    function handleEditOccupationClick() {
        let row = $(this).closest('tr');
         if ($(this).text() === 'Szerkesztés') {
            startEditingOccupation(row);
        } else {
            finishEditingOccupation(row);
        }
    }

    function startEditingOccupation(row) {
        row.find('input.occupation-data').removeAttr('readonly');
        row.find('.edit-button').text('Mentés');
        let cancelBtn = $('<button class="btn btn-secondary btn-sm cancel-button">Mégse</button>');
        row.find('.edit-button').after(cancelBtn);
        row.find('input.occupation-data').each(function() {
            $(this).data('original-value', $(this).val());
        });
    }

      function finishEditingOccupation(row) {
        // Get the updated data from the input fields
        let updatedData = {
            name: row.find('input[data-field="name"]').val()
        };

        // Get the occupation ID from the hidden span
        let occupationId = parseInt(row.find('.occupation-id').text(), 10);

        if (occupationContainer.updateOccupation(occupationId, updatedData)) {
            console.log("Occupation updated in container.  Ready to save to server:", occupationId, updatedData);
            alert("Occupation updated! (Replace this with AJAX)"); // Replace with AJAX
            //TODO: add ajax
            row.find('input.occupation-data').attr('readonly', true);
            row.find('.edit-button').text('Szerkesztés');
            row.find('.cancel-button').remove();
        } else {
            console.error("Occupation with ID " + occupationId + " not found for update.");
            alert("Occupation with ID " + occupationId + " not found for update.");
        }
    }
    function handleCancelOccupationClick() {
         let row = $(this).closest('tr');
        row.find('input.occupation-data').each(function() {
            $(this).val($(this).data('original-value')).attr('readonly', true);
        });
        $(this).remove();
        row.find('.edit-button').text('Szerkesztés');
    }

    function handleDeleteOccupationClick() {
         let row = $(this).closest('tr');
        if (confirm('Biztosan törölni szeretnéd?')) {
            let occupationId = parseInt(row.find('.occupation-id').text(), 10);
            if(occupationContainer.removeOccupationById(occupationId)){
                row.remove();
                //TODO add ajax
            } else {
                 console.error("Occupation with ID " + occupationId + " not found for deletion.");
            }
        }
    }
    //--Event Occupation handlers--
     function handleDeleteEventOccupationClick() {
        let row = $(this).closest('tr');
        if (confirm('Biztosan törölni szeretnéd?')) {
            let eventId = parseInt(row.find('.event-id').text(), 10);
            let occupationId = parseInt(row.find('.occupation-id').text(), 10);

            if (eventOccupationContainer.removeEventOccupation(eventId, occupationId)) {
                row.remove();
                console.log("Event-Occupation removed");
                alert("Event-Occupation removed! (Replace this with AJAX)");
                //TODO Add ajax
            } else {
                console.error("Event-Occupation not found for deletion.");
            }
        }
    }

    // -- Load Data Functions --
    function loadOccupations() {
        // TODO: Replace with AJAX call to php/get_foglalkozasok.php
        // Placeholder data:
        const occupation1 = new Occupation(1, "Lego Robot");
        const occupation2 = new Occupation(2, "Áramkör építés");
        occupationContainer.addOccupation(occupation1);
        occupationContainer.addOccupation(occupation2);

         $('#occupationsTable tbody').empty();
        occupationContainer.getAllOccupations().forEach(function(occupation) {
            addOccupationRow(occupation);
        });
    }
    function loadEventsIntoSelect() {
        // TODO: Replace with AJAX
        var events = eventContainer.getAllEvents();
        let options = '<option value="">Válassz eseményt</option>';
        events.forEach(event => {
                options += `<option value="${event.id}">${event.name} - ${event.date}</option>`;
        });
         $('#eventSelect').html(options);
    }
     function loadOccupationsIntoSelect() {
        let options = '<option value="">Válassz foglalkozást</option>';
        occupationContainer.getAllOccupations().forEach(occupation => {
            options += `<option value="${occupation.id}">${occupation.name}</option>`;
        });
        $('#occupationSelect').html(options);
    }

    function loadEventOccupations() {
        // TODO: Replace with AJAX call to php/get_esemeny_foglalkozasok.php
        // Placeholder data:

        const eo1 = new EventOccupation(1, "Dance Rehearsal", 1, "Lego Robot", 2, 4); // Added hoursCount
        const eo2 = new EventOccupation(2, "Poetry Slam", 2, "Áramkör építés", 5, 2); // Added hoursCount
        eventOccupationContainer.addEventOccupation(eo1);
        eventOccupationContainer.addEventOccupation(eo2);

        $('#eventOccupationsTable tbody').empty();
        eventOccupationContainer.getAllEventOccupations().forEach(function(eventOccupation) {
            addEventOccupationRow(eventOccupation);
        });
    }

    // -- Add Row Functions --
    function addOccupationRow(occupation) {
        let row = $('<tr>');
        row.append('<td hidden><span class="occupation-id">' + occupation.id + '</span></td>');
        row.append($('<td>').text(occupation.id));
        row.append($('<td>').append($('<input type="text" class="form-control occupation-data" data-field="name" readonly>').val(occupation.name)));

        let actionsCell = $('<td>');
        let editButton = $('<button class="btn btn-primary btn-sm edit-button">Szerkesztés</button>');
        let deleteButton = $('<button class="btn btn-danger btn-sm delete-button">Törlés</button>');
        actionsCell.append(editButton, deleteButton);

        row.append(actionsCell);
        $('#occupationsTable tbody').append(row);
    }

    function addEventOccupationRow(eventOccupation) {
        let row = $('<tr>');
        row.append('<td hidden><span class="event-id">' + eventOccupation.eventId + '</span></td>');
        row.append('<td hidden><span class="occupation-id">' + eventOccupation.occupationId + '</span></td>');
        row.append($('<td>').text(eventOccupation.eventName));
        row.append($('<td>').text(eventOccupation.occupationName));
        row.append($('<td>').text(eventOccupation.mentorCount));
        row.append($('<td>').text(eventOccupation.hoursCount)); // Display hoursCount

        let deleteButton = $('<button class="btn btn-danger btn-sm delete-event-occupation-button">Törlés</button>');
        row.append($('<td>').append(deleteButton));

        $('#eventOccupationsTable tbody').append(row);
    }

    // -- Form Show/Hide Functions --

    function showAddOccupationEventForm() {
        loadEventsIntoSelect();
        loadOccupationsIntoSelect();
        $('#addOccupationEventForm').show();
    }

    function hideAddOccupationEventForm() {
        $('#addOccupationEventForm').hide();
        $('#eventSelect').val('');
        $('#occupationSelect').val('');
        $('#mentorCount').val('1');
        $('#hoursCount').val(''); // Clear hoursCount
    }
    //--Add Event Occupation Handler--
     function handleAddOccupationToEvent() {
        let eventId = $('#eventSelect').val();
        let occupationId = $('#occupationSelect').val();
        let mentorCount = $('#mentorCount').val();
        let hoursCount = $('#hoursCount').val(); // Get hoursCount

        if (!eventId || !occupationId || !mentorCount || !hoursCount) { // Validate hoursCount
            alert('Kérlek válassz eseményt, foglalkozást, és add meg a szükséges mentorok számát és óraszámot!');
            return;
        }
        if(isNaN(parseInt(hoursCount)) || parseInt(hoursCount) <= 0){
            alert("Az órák száma egy 0-nál nagyobb szám kell, hogy legyen!");
            return;
        }
        if(isNaN(parseInt(mentorCount)) || parseInt(mentorCount) <= 0){
             alert('A szükséges mentorok száma egy 0-nál nagyobb szám kell, hogy legyen!');
            return;
        }

        let event = eventContainer.getEventById(parseInt(eventId));
        let occupation = occupationContainer.getOccupationById(parseInt(occupationId));
        if(!event || !occupation){
            console.error("Event or occupation not found")
            return;
        }
        const eventOccupation = new EventOccupation(parseInt(eventId), event.name, parseInt(occupationId), occupation.name, parseInt(mentorCount), parseInt(hoursCount)); // Include hoursCount
        eventOccupationContainer.addEventOccupation(eventOccupation);

        addEventOccupationRow(eventOccupation); // Update the UI
        console.log("Adding occupation to event:", { eventId, occupationId, mentorCount, hoursCount });
        alert("Adding occupation to event (Replace this with AJAX)");  // Replace with AJAX
        //TODO: Add ajax

    }
    return {
        Occupation: Occupation,
        OccupationContainer: OccupationContainer,
        occupationContainer: occupationContainer,
        EventOccupation: EventOccupation,
        EventOccupationContainer: EventOccupationContainer,
        eventOccupationContainer: eventOccupationContainer
        };
});

