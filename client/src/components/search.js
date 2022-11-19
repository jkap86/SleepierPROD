import React, { useCallback, useState } from "react";

const Search = ({ id, sendSearched, placeholder, list }) => {
    const [searched, setSearched] = useState('')

    const handleSearch = (e) => {
        setSearched(e.target.value)
        sendSearched(e.target.value)
    }

    return <>
        <div className={'search_container'}>
            <input
                className={'search'}
                onChange={handleSearch}
                id={id === undefined ? null : id}
                list={placeholder}
                placeholder={placeholder}
                type="text"
                value={searched}
            />
            {
                searched === '' ? null :
                    <button
                        type="reset"
                        onClick={handleSearch}
                        value={''}
                        className={'clear clickable'}
                    >
                        x
                    </button>
            }
            <datalist id={placeholder}>
                {list.sort((a, b) => a > b ? 1 : -1).map((i, index) =>
                    <option key={index}>{i}</option>
                )}
            </datalist>
        </div>
    </>
}

export default Search;