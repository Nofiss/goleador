import type { FieldValues, Path, UseFormSetError } from "react-hook-form";

/**
 * Maps backend validation errors (PascalCase) to frontend form fields (camelCase)
 * and sets them in react-hook-form state.
 *
 * @param errors The errors object from the server (e.g., error.response.data.errors)
 * @param setError The setError function from react-hook-form
 */
export function setApiErrors<T extends FieldValues>(
	errors: Record<string, string[]>,
	setError: UseFormSetError<T>,
) {
	for (const [key, messages] of Object.entries(errors)) {
		// Convert PascalCase to camelCase (e.g., "Nickname" -> "nickname")
		const fieldName = (key.charAt(0).toLowerCase() + key.slice(1)) as Path<T>;

		if (messages && messages.length > 0) {
			setError(fieldName, {
				type: "server",
				message: messages[0],
			});
		}
	}
}
