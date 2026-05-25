import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventCrud } from './event-crud';

describe('EventCrud', () => {
  let component: EventCrud;
  let fixture: ComponentFixture<EventCrud>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventCrud],
    }).compileComponents();

    fixture = TestBed.createComponent(EventCrud);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
