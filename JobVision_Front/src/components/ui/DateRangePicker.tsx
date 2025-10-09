import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';

interface DateRangePickerProps {
    startDate: string;
    endDate: string;
    onStartDateChange: (date: string) => void;
    onEndDateChange: (date: string) => void;
    className?: string;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
                                                                    startDate,
                                                                    endDate,
                                                                    onStartDateChange,
                                                                    onEndDateChange,
                                                                    className = ""
                                                                }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };


    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const days = [];

        // Ajouter les jours vides du mois précédent
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null);
        }

        // Ajouter les jours du mois
        for (let day = 1; day <= daysInMonth; day++) {
            days.push(new Date(year, month, day));
        }

        return days;
    };

    const isDateInRange = (date: Date) => {
        if (!startDate || !endDate) return false;
        const dateStr = formatDate(date);
        return dateStr >= startDate && dateStr <= endDate;
    };

    const isDateInDragRange = (date: Date) => {
        if (!isDragging || !dragStartDate) return false;
        const dateStr = formatDate(date);

        // Pendant le drag, on montre la plage entre dragStartDate et la date actuelle
        // Cette fonction sera utilisée pour mettre en surbrillance la plage en cours de sélection
        return dateStr >= Math.min(dragStartDate, startDate || dragStartDate) &&
            dateStr <= Math.max(dragStartDate, endDate || dragStartDate);
    };

    const isDateSelected = (date: Date) => {
        const dateStr = formatDate(date);
        return dateStr === startDate || dateStr === endDate;
    };

    const isDateStart = (date: Date) => {
        return formatDate(date) === startDate;
    };

    const isDateEnd = (date: Date) => {
        return formatDate(date) === endDate;
    };

    const [isDragging, setIsDragging] = useState(false);
    const [dragStartDate, setDragStartDate] = useState<string | null>(null);

    // Gestionnaire global pour terminer le drag
    React.useEffect(() => {
        const handleGlobalMouseUp = () => {
            if (isDragging) {
                setIsDragging(false);
                setDragStartDate(null);
            }
        };

        if (isDragging) {
            document.addEventListener('mouseup', handleGlobalMouseUp);
            return () => document.removeEventListener('mouseup', handleGlobalMouseUp);
        }
    }, [isDragging]);

    const handleDateMouseDown = (date: Date) => {
        const dateStr = formatDate(date);
        setIsDragging(true);
        setDragStartDate(dateStr);
        onStartDateChange(dateStr);
        onEndDateChange('');
    };

    const handleDateMouseEnter = (date: Date) => {
        if (isDragging && dragStartDate) {
            const dateStr = formatDate(date);
            if (dateStr < dragStartDate) {
                onStartDateChange(dateStr);
                onEndDateChange(dragStartDate);
            } else {
                onStartDateChange(dragStartDate);
                onEndDateChange(dateStr);
            }
        }
    };

    const handleDateMouseUp = () => {
        setIsDragging(false);
        setDragStartDate(null);
    };

    const handleDateClick = (date: Date) => {
        if (isDragging) return; // Éviter les conflits avec le drag

        const dateStr = formatDate(date);

        if (!startDate || (startDate && endDate)) {
            // Première sélection ou nouvelle sélection
            onStartDateChange(dateStr);
            onEndDateChange('');
        } else if (startDate && !endDate) {
            // Deuxième sélection
            if (dateStr < startDate) {
                onEndDateChange(startDate);
                onStartDateChange(dateStr);
            } else {
                onEndDateChange(dateStr);
            }
        }
    };

    const navigateMonth = (direction: 'prev' | 'next') => {
        setCurrentMonth(prev => {
            const newDate = new Date(prev);
            if (direction === 'prev') {
                newDate.setMonth(prev.getMonth() - 1);
            } else {
                newDate.setMonth(prev.getMonth() + 1);
            }
            return newDate;
        });
    };

    const monthNames = [
        'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];

    const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

    const days = getDaysInMonth(currentMonth);

    return (
        <div className={`relative ${className}`}>
            {/* Affichage des dates sélectionnées */}
            <div className="flex items-center gap-2 mb-2">
                <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">
                        Plage de dates
                    </label>
                    <div className="flex items-center gap-2">
                        <div className="flex-1">
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => onStartDateChange(e.target.value)}
                                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all w-full"
                                placeholder="Date de début"
                            />
                        </div>
                        <span className="text-gray-400 dark:text-gray-500 text-sm">à</span>
                        <div className="flex-1">
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => onEndDateChange(e.target.value)}
                                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all w-full"
                                placeholder="Date de fin"
                            />
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setIsOpen(!isOpen)}
                            className="shrink-0"
                        >
                            <Calendar className="h-4 w-4" />
                        </Button>
                    </div>

                    {/*/!* Affichage des dates sélectionnées en temps réel *!/*/}
                    {/*{(startDate || endDate) && (*/}
                    {/*    <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">*/}
                    {/*        {startDate && endDate ? (*/}
                    {/*            <span>*/}
                    {/*                Du <span className="font-medium text-blue-600 dark:text-blue-400">{createLocalDate(startDate).toLocaleDateString('fr-FR')}</span> au <span className="font-medium text-blue-600 dark:text-blue-400">{createLocalDate(endDate).toLocaleDateString('fr-FR')}</span>*/}
                    {/*            </span>*/}
                    {/*        ) : startDate ? (*/}
                    {/*            <span>*/}
                    {/*                À partir du <span className="font-medium text-blue-600 dark:text-blue-400">{createLocalDate(startDate).toLocaleDateString('fr-FR')}</span>*/}
                    {/*            </span>*/}
                    {/*        ) : null}*/}
                    {/*    </div>*/}
                    {/*)}*/}
                </div>
            </div>

            {/* Calendrier popup */}
            {isOpen && (
                <div className="absolute top-full left-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 p-4 min-w-[320px]">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                        </h3>
                        {isDragging && (
                            <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                                Glissez pour sélectionner la plage
                            </div>
                        )}
                        <div className="flex gap-1">
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => navigateMonth('prev')}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => navigateMonth('next')}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {dayNames.map(day => (
                            <div key={day} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-2">
                                {day}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                        {days.map((day, index) => {
                            if (!day) {
                                return <div key={index} className="h-8" />;
                            }

                            const isInRange = isDateInRange(day);
                            const isInDragRange = isDateInDragRange(day);
                            const isSelected = isDateSelected(day);
                            const isStart = isDateStart(day);
                            const isEnd = isDateEnd(day);
                            const isToday = formatDate(day) === formatDate(new Date());

                            return (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => handleDateClick(day)}
                                    onMouseDown={() => handleDateMouseDown(day)}
                                    onMouseEnter={() => handleDateMouseEnter(day)}
                                    onMouseUp={handleDateMouseUp}
                                    className={`
                                        h-8 w-8 text-sm rounded-md transition-all select-none
                                        ${isSelected
                                        ? 'bg-blue-600 text-white font-semibold'
                                        : isInRange || isInDragRange
                                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                            : isToday
                                                ? 'bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-gray-100 font-semibold'
                                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }
                                        ${isStart ? 'rounded-l-md' : ''}
                                        ${isEnd ? 'rounded-r-md' : ''}
                                        ${isDragging ? 'cursor-grabbing' : 'cursor-pointer'}
                                    `}
                                >
                                    {day.getDate()}
                                </button>
                            );
                        })}
                    </div>

                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                onStartDateChange('');
                                onEndDateChange('');
                            }}
                        >
                            Effacer
                        </Button>
                        <Button
                            type="button"
                            variant="primary"
                            size="sm"
                            onClick={() => setIsOpen(false)}
                        >
                            Fermer
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};
