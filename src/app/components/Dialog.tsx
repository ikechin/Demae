import React, { createContext, useContext, useState } from 'react'
import { Snackbar, Button, Dialog, DialogTitle, DialogContent, DialogActions, PropTypes } from '@material-ui/core';

interface Action {
	title: string
	autoFocus?: boolean
	color?: PropTypes.Color
	handler?: () => void
}

interface Prop {
	title?: string
	body?: string
	actions: Action[]
}

const _Dialog = ({ open, title, body, actions, onClose }: { open: boolean, title?: string, body?: string, actions: Action[], onClose: () => void }) => {
	if (open) {
		return (
			<Dialog onClose={onClose} open={open}>
				<DialogTitle>
					{title}
				</DialogTitle>
				<DialogContent dividers>
					{body}
				</DialogContent>
				<DialogActions>
					{actions.map((action, index) => {
						return (
							<Button key={index} autoFocus={action.autoFocus} onClick={() => {
								if (action.handler) {
									action.handler()
								}
								onClose()
							}} color={action.color}>
								{action.title}
							</Button>
						)
					})
					}
				</DialogActions>
			</Dialog>
		)
	}
	return <></>
}

export const DialogContext = createContext<[(title: string | undefined, body: string | undefined, actions: Action[]) => void, () => void, boolean]>([() => { }, () => { }, false])
export const DialogProvider = ({ children }: { children: any }) => {
	const [state, setState] = useState<Prop>({
		title: undefined,
		body: undefined,
		actions: []
	})
	const open = !!state.title || !!state.body
	const onClose = () => {
		setState({
			title: undefined,
			body: undefined,
			actions: []
		})
	}
	const setDialog = (title: string | undefined, body: string | undefined, actions: Action[]) => {
		setState({ title, body, actions })
	}
	return (
		<DialogContext.Provider value={[setDialog, onClose, open]}>
			<_Dialog open={open} title={state.title} body={state.body} actions={state.actions} onClose={onClose} />
			{children}
		</DialogContext.Provider>
	)
}

export const useDialog = () => {
	return useContext(DialogContext)
}
