import React from 'react';
import FullCalendar, { EventDropArg, EventInput } from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

interface Client {
  _id: string;
  name: string;
}

interface ContentItem {
  _id: string;
  client: string | Client;
  contentType: string;
  publishAt: string;
  status: string;
}

interface CalendarProps {
  content: ContentItem[];
  onEventClick: (event: ContentItem) => void;
  onDateClick: (date: string) => void;
  onEventMove: ({ id, newDate }: { id: string, newDate: string }) => Promise<void>;
}

const CalendarView: React.FC<CalendarProps> = ({
  content,
  onEventClick,
  onDateClick,
  onEventMove,
}) => {
  const getEventColor = (status: string) => {
    switch (status) {
      case 'Posted':
        return '#10B981';
      case 'Not Posted':
        return '#EF4444';
      case 'Pending':
        return '#F59E0B';
      default:
        return '#6B7280';
    }
  };

  const events: EventInput[] = content.map(item => ({
    id: item._id,
    title: `${typeof item.client === 'object' ? item.client.name : ''} - ${item.contentType}`,
    start: item.publishAt,
    backgroundColor: getEventColor(item.status),
    borderColor: getEventColor(item.status),
    extendedProps: { content: item }
  }));

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}
        events={events}
        eventClick={info => onEventClick(info.event.extendedProps.content)}
        dateClick={info => onDateClick(info.dateStr)}
        editable={true}
        eventDrop={async (info: EventDropArg) => {
          try {
            await onEventMove({ id: info.event.id, newDate: info.event.startStr });
          } catch (error) {
            info.revert();
          }
        }}
        height="auto"
        eventDisplay="block"
        dayMaxEvents={3}
        eventTimeFormat={{
          hour: 'numeric',
          minute: '2-digit',
          omitZeroMinute: false,
          meridiem: 'short'
        }}
        moreLinkText="more"
        eventClassNames="cursor-pointer"
      />
    </div>
  );
};

export default CalendarView;
