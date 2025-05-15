interface LeadInitialsProps {
  firstName: string;
  lastName: string;
}

const LeadInitials = ({ firstName, lastName }: LeadInitialsProps) => {
  // Get first letter of first name and first letter of last name
  const firstInitial = firstName.charAt(0).toUpperCase();
  const lastInitial = lastName.charAt(0).toUpperCase();
  const initials = lastInitial ? `${firstInitial}${lastInitial}` : firstInitial;

  return (
    <div className="text-xs bg-gray-200 text-[#606770] rounded-full w-6 h-6 flex items-center justify-center mr-2">
      {initials}
    </div>
  );
};

export default LeadInitials;
