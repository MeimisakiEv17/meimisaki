import React from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const Calendar = ({ selected, onChange, showTimeSelect, timeIntervals, dateFormat }) => {
  return (
    <DatePicker
      selected={selected}
      onChange={onChange}
      showTimeSelect={showTimeSelect}
      timeIntervals={timeIntervals}
      dateFormat={dateFormat}
      className="px-4 py-2 border rounded"
    />
  );
};

export default Calendar;