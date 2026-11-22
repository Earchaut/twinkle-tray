import React from "react";
import { useEffect, Component } from "react"
import PropTypes from 'prop-types';
import { displayLevel } from "./utilts/monitor.util";

export default class Slider extends Component {

    firingEvent = false
    handleChange = (event) => {
        if(event.target.value !== this.props.level)
        this.setState({ level: this.cap(event.target.value) }, this.fireChange)
    }

    handleRangeChange = (event) => {
        this.handleChange(event)
        if (this.rangePointerActive) this.rangeChanged = true
    }

    handleRangePointerDown = () => {
        if (this.rangePointerActive) return
        this.rangePointerActive = true
        this.rangeChanged = false
        this.props.onRangeChangeStart?.()
        window.addEventListener("pointerup", this.handleRangePointerUp)
        window.addEventListener("pointercancel", this.handleRangePointerUp)
    }

    handleRangePointerUp = () => {
        if (!this.rangePointerActive) return
        this.rangePointerActive = false
        window.removeEventListener("pointerup", this.handleRangePointerUp)
        window.removeEventListener("pointercancel", this.handleRangePointerUp)
        this.props.onRangeChangeEnd?.(this.rangeChanged, this.cap(this.state.level), this)
        this.rangeChanged = false
    }

    handleWheel = (event) => {
        if (this.props.scrolling === false) return false;
        this.setState({ level: this.cap((this.state.level * 1) + Math.sign(event.deltaY) * -1 * (this.props.scrollAmount ?? 1)) }, this.fireChange)
    }

    componentWillUnmount() {
        window.removeEventListener("pointerup", this.handleRangePointerUp)
        window.removeEventListener("pointercancel", this.handleRangePointerUp)
    }

    fireChange = () => {
        if (this.firingEvent === false && this.props.onChange && typeof this.props.onChange == "function") {
            this.firingEvent = true
            this.props.onChange(this.cap(this.state.level) * 1, this)
            this.firingEvent = false
        }
    }

    getName = () => {
        if (this.props.name) {
            return (
                <div className="name-row">
                    <div className="icon" style={{display: (this.props.icon === false ? "none" : "block")}}>{(this.props.monitortype == "wmi" ? <span>&#xE770;</span> : <span>&#xE7F4;</span>)}</div>
                    <div className="title">{this.props.name}</div>
                    {this.props.afterName}
                </div>
            )
        }
    }

    cap = (level) => {
        const min = (this.props.min || 0) * 1
        const max = (this.props.max || 100) * 1
        let capped = level * 1
        if (level < min) {
            capped = min
        } else if (level > max) {
            capped = max
        }
        return capped
    }

    progressStyle = () => {
        const min = (this.props.min || 0) * 1
        const max = (this.props.max || 100) * 1
        const level = this.cap((this.props.level || 0) * 1)
        return { width: (0 + (((level - min) * (100 / (max - min))))) + "%" }
    }

    constructor(props) {
        super(props);
        this.state = {
            level: this.cap((this.props.level === undefined ? 50 : this.props.level)),
        }
        //this.fireChange()
    }

    componentDidUpdate(oldProps) {
        if (oldProps.max != this.props.max || oldProps.min != this.props.min) {
            this.setState({
                level: this.cap(this.props.level)
            }, this.fireChange())
        }
    }

    render() {
        const min = (this.props.min || 0) * 1
        const max = (this.props.max || 100) * 1
        const level = this.cap(this.props.level)
        return (
            <div className="monitor-item" onWheel={this.handleWheel}>
                {this.getName()}
                <div className="input--range" data-height={this.props.height}>
                    <div className="rangeGroup">
                        <input type="range" min={min} max={max} value={level} data-percent={displayLevel(level) + "%"} onChange={this.handleRangeChange} onPointerDown={this.props.onRangeChangeEnd ? this.handleRangePointerDown : undefined} className="range" />
                        <div className="progress" style={this.progressStyle()}></div>
                    </div>
                    <input type="number" min={min} max={max} value={displayLevel(level)} onChange={this.handleChange} className="val" />
                </div>
            </div>
        );
    }

};