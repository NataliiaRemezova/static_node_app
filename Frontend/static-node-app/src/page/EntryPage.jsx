import Entry from "../components/Entry.jsx";
import ListOfEntries from "../components/ListOfEntries.jsx";
import {Calendar} from "@nextui-org/calendar";
import { useState, useEffect } from 'react';
import {parseDate, today, getLocalTimeZone} from "@internationalized/date";
import {Button} from "@nextui-org/react";
import { RiArrowRightSFill } from "react-icons/ri";
import { RiArrowLeftSFill } from "react-icons/ri"
import "../styles/EntryPage.css";

function EntryPage(){

    function formatDate(date) {
        // Extract the year, month, and day from the date object
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based, so we add 1
        const day = String(date.getDate()).padStart(2, '0'); // Pad single digit days with a leading zero
    
        // Format the date as "YYYY-MM-DD"
        return `${year}-${month}-${day}`;
    }
    
    // Get the current date
    const currentDate = new Date();
    
    // Convert the current date to the "YYYY-MM-DD" format
    const formattedDate = formatDate(currentDate);

    
    const [entries, setEntries] = useState([]);
    const [entryTextfield, setEntryTextfield] = useState('');
    const [entryToEdit, setEntryToEdit] = useState(null);
    const [entryToDelete, setEntryToDelete] = useState(null);
    const [selectedDate, setSelectedDate] = useState(parseDate(formattedDate));
    const [backgroundNextArrow, setBackgroundNextArrow] = useState("#585a58b0");
    const [foregroundNextArrow, setForegroundNextArrow] = useState("#353830c9");
    const [backgroundPreviousArrow, setBackgroundPreviousArrow] = useState("#5faf4fb0");
    const [foregroundPreviousArrow, setForegroundPreviousArrow] = useState("#424b35c9");

    useEffect(() => {
        fetch('http://localhost:5000/api/entry/get-entries')
            .then(response => response.json())
            .then(data => setEntries(data))
            .catch(error => console.error('Error fetching entries:', error));
    }, []);

    const addEntry = (newEntryText) => {
        fetch('http://localhost:5000/api/entry/create-entry', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text: newEntryText, date: new Date(selectedDate).toISOString() })
        })
            .then(response => response.json())
            .then(data => {
                setEntries([...entries, data])
                setEntryToEdit(data._id);
            })
            .catch(error => console.error('Error adding entry:', error));
    };

    const setupEditEntry = (id, text) => {
        setEntryToEdit(id);
        setEntryTextfield(text);
    };

    const setupNewEntry = () => {
        setEntryToEdit(null);
        setEntryTextfield('');
    };

    const editEntry = (newEntryText) => {
        fetch(`http://localhost:5000/api/entry/update-entry/${entryToEdit}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({text: newEntryText, date: new Date(selectedDate).toISOString() })
        })
            .then(response => response.json())
            .then((data) => {
                // if entry is entryToEdit --> change its text
                setEntries(entries.map(entry => {
                    if (entry._id === entryToEdit) {
                        return { ...entry, text: newEntryText, date: new Date(selectedDate).toISOString() };
                    }
                    return entry;
                }));
            })
            .catch(error => console.error('Error updating entry:', error));
    };

    const deleteEntry = (id) => {
        setEntryToDelete(id);
    };

    const confirmDelete = () => {
        fetch(`http://localhost:5000/api/entry/delete-entry/${entryToDelete}`, {
            method: 'DELETE'
        })
            .then(() => {
                setEntries(entries.filter(entry => entry._id !== entryToDelete));
                setEntryToDelete(null);
                setupNewEntry();
            })
            .catch(error => console.error('Error deleting entry:', error));
    };

    const cancelDelete = () => {
        setEntryToDelete(null);
    };

    const findEntryByDate = (newDate) => {
        //callback function to make sure setSelectedDate() happens first
        setSelectedDate(() => {
            const thisDate = new Date(newDate).toISOString();
    
            //find entry by current date
            for (const entry of entries) {
                if (entry.date === thisDate) {
                    setupEditEntry(entry._id, entry.text);
                    return newDate;
                }
            }
            setupNewEntry();
            return newDate;
        });
    };

    const changeToNextDay = () => {
        const currentDate = new Date(selectedDate);
        currentDate.setDate(currentDate.getDate()+1);

        // checking date to ensure no entries are added for dates ahead of the current date
        const today = new Date();
        if(currentDate.getDate() > today.getDate()) currentDate.setDate(today.getDate());
        if(currentDate.getDate() >= today.getDate()) {
            setBackgroundNextArrow("#585a58b0");
            setForegroundNextArrow("#353830c9");
        }

        const selectedYear = selectedDate.year;
        const selectedMonth = selectedDate.month;
        const selectedDay = currentDate.getDate();
        
        const currentMonth = String(selectedMonth).padStart(2, '0');
        const nextDay = String(selectedDay).padStart(2, '0');

        const newSelectedDate = `${selectedYear}-${currentMonth}-${nextDay}`;

        findEntryByDate(newSelectedDate);

        setSelectedDate(parseDate(newSelectedDate));

        setBackgroundPreviousArrow("#5faf4fb0");
        setForegroundPreviousArrow("#424b35c9");
    }

    const changeToPreviousDay = () => {
        const currentDate = new Date(selectedDate);
        currentDate.setDate(currentDate.getDate()-1);

        if(currentDate.getDate() == 31) currentDate.setDate(1);
        if(currentDate.getDate() == 1) {
            setBackgroundPreviousArrow("#585a58b0"); // gray
            setForegroundPreviousArrow("#424b35c9"); // gray
        }
        

        const selectedYear = selectedDate.year;
        const selectedMonth = selectedDate.month;
        const selectedDay = currentDate.getDate();
        
        const currentMonth = String(selectedMonth).padStart(2, '0');
        const previousDay = String(selectedDay).padStart(2, '0');

        const newSelectedDate = `${selectedYear}-${currentMonth}-${previousDay}`;

        findEntryByDate(newSelectedDate);

        setSelectedDate(parseDate(newSelectedDate));

        setBackgroundNextArrow("#5faf4fb0");
        setForegroundNextArrow("#424b35c9");
    }

    return(
        <div>
            <div className="flexContainer">
                <div>
                    <Calendar 
                    aria-label="Date (Controlled)" 
                    value={selectedDate} 
                    onChange={findEntryByDate}
                    maxValue={today(getLocalTimeZone())}
                    />
                </div>
                <div className="entry">
                    <Entry addEntry={addEntry} entryTextfield={entryTextfield} setEntryTextfield={setEntryTextfield} selectedDate={selectedDate} entryToEdit={entryToEdit} editEntry={editEntry} deleteEntry={deleteEntry} confirmDelete={confirmDelete} cancelDelete={cancelDelete} entryToDelete={entryToDelete}/>
                    {/*<ListOfEntries entries={entries} setupEditEntry={setupEditEntry} deleteEntry={deleteEntry} confirmDelete={confirmDelete} cancelDelete={cancelDelete} entryToDelete={entryToDelete} />*/}
                    <Button isIconOnly aria-label="Previous" className="arrowButton" onClick={changeToPreviousDay} style={{backgroundColor: backgroundPreviousArrow, color: foregroundPreviousArrow}}>
                        <RiArrowLeftSFill />
                    </Button>    
                    <Button isIconOnly aria-label="Next" className="arrowButton" onClick={changeToNextDay} style={{backgroundColor: backgroundNextArrow, color: foregroundNextArrow}}>
                        <RiArrowRightSFill />
                    </Button>  
                </div>
            </div>
        </div>
    );
}

export default EntryPage