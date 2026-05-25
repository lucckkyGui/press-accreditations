
import { format } from "date-fns";
import { pl, enUS } from "date-fns/locale";

interface FormattedDateProps {
  date: string;
  language: string;
}

const FormattedDate = ({ date, language }: FormattedDateProps) => {
  return (
    <span>
      {format(new Date(date), "d MMMM yyyy, HH:mm", {
        locale: language === 'pl' ? pl : enUS,
      })}
    </span>
  );
};

export default FormattedDate;
