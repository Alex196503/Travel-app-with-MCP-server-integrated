// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react"
import { afterEach, test, expect, describe, beforeEach, vi } from "vitest"
import ApiPage from "~/routes/api"
import "@testing-library/jest-dom/vitest"
import { act } from "react"
import { createMemoryRouter, RouterProvider } from "react-router"
import { mockedCountries } from "../test-mocks/user-data-mocks"
import { api } from "../../axios/axios"
import PaginationComponent from "~/components/ApiComponents/Pagination"

vi.mock("../../axios/axios", () => ({
  api: {
    post: vi.fn()
  }
}))

vi.mocked(api.post).mockResolvedValueOnce({
  data: {
    reply: "Here is the statistical breakdown for Spain..."
  }
})

const router = createMemoryRouter(
  [
    {
      path: "/",
      Component: ApiPage,
      loader: () => ({
        countries: mockedCountries
      })
    }
  ],
  { initialEntries: ["/"] }
)

describe("test suite validating the user interaction with API Countries page", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllTimers()
  })

  test("checks if the debouncer works and the country found is rendered", async () => {
    render(<RouterProvider router={router} />)
    const input = screen.getByTestId("custom-element")
    expect(screen.getByText(/spain/i)).toBeInTheDocument()
    expect(screen.getByText(/france/i)).toBeInTheDocument()
    fireEvent.change(input, { target: { value: "Spain" } })
    expect(screen.getByText(/france/i)).toBeInTheDocument()
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000)
    })
    expect(screen.getByText(/spain/i)).toBeInTheDocument()
    expect(screen.queryByText(/france/i)).not.toBeInTheDocument()
  })

  test("checking if the MCP server sends back an answer and frontend displays it", async () => {
    render(<RouterProvider router={router} />)
    const aiInput = screen.getByTestId("aiprompt")
    const submitButton = screen.getByTestId("btn-submit")
    fireEvent.change(aiInput, {
      target: { value: "Tell me about Spain" }
    })
    await act(async () => {
      fireEvent.click(submitButton)
    })
    expect(
      screen.getByText(/here is the statistical breakdown for spain/i)
    ).toBeInTheDocument()
    expect(api.post).toHaveBeenCalledWith("/prompt/ai", {
      prompt: "Tell me about Spain"
    })
    expect(submitButton).toBeDisabled()
    expect(submitButton.textContent).toContain("Wait to send")
  })
})

describe("test suite validating the pagination component", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.useRealTimers()
  })

  test("checking if the component manages to fall back to one page", () => {
    render(
      <PaginationComponent
        currentPage={1}
        numberOfPages={1}
        setCurrentPage={() => {}}
      />
    )
    const prevBtn = screen.getByTestId("btn-previous")
    const nextBtn = screen.getByTestId("btn-next")
    const numberOfPagesBtn = screen.getByRole("button", { name: "1" })
    expect(prevBtn).toBeDisabled()
    expect(nextBtn).toBeDisabled()
    expect(numberOfPagesBtn.textContent).toEqual("1")
  })
  test("checking if the buttons work properly for more pages", () => {
    render(
      <PaginationComponent
        currentPage={4}
        numberOfPages={10}
        setCurrentPage={() => {}}
      />
    )
    expect(
      screen.getByRole("button", { name: "1" })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "10" })
    ).toBeInTheDocument()
    const elipsis = screen.getAllByText("...")
    const currentPage = screen.getByRole("button", { name: "4" })
    expect(elipsis.length).toBe(2)
    expect(
      screen.getByRole("button", { name: "3" })
    ).toBeInTheDocument()
    expect(currentPage).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "5" })
    ).toBeInTheDocument()
    expect(currentPage).toHaveClass("bg-zinc-950")
    expect(screen.getByTestId("btn-previous")).not.toBeDisabled()
    expect(screen.getByTestId("btn-next")).not.toBeDisabled()
  })

  test("renders correct buttons if we are on the last page", () => {
    render(
      <PaginationComponent
        currentPage={10}
        numberOfPages={10}
        setCurrentPage={() => {}}
      />
    )
    expect(
      screen.getByRole("button", { name: "10" })
    ).toBeInTheDocument()
    const elipsis = screen.getAllByText("...")
    expect(elipsis.length).toEqual(1)
    expect(
      screen.getByRole("button", { name: "1" })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "9" })
    ).toBeInTheDocument()
    expect(screen.getByTestId("btn-previous")).not.toBeDisabled()
    expect(screen.getByTestId("btn-next")).toBeDisabled()
  })

  test("filters countries with search input and updates pagination dynamically", async () => {
    render(<RouterProvider router={router} />)
    const searchInput = screen.getByTestId("custom-element")
    fireEvent.change(searchInput, { target: { value: "an" } })
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000)
    })
    expect(screen.getByAltText(/andorra/i)).toBeInTheDocument()
    const elipses = screen.queryAllByText("...")
    expect(elipses.length).toEqual(0)
    expect(screen.getByTestId("btn-previous")).toBeDisabled()
    expect(screen.getByTestId("btn-next")).toBeDisabled()
  })
})
